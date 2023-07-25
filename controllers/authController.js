const jwt = require('jsonwebtoken');
const {promisify} = require('util'); // to get an access to the built-in promisifying function
const crypto = require('crypto');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// sign jwt
const signToken = (id) => {
    return jwt.sign(
        {id}, // payload to put in jwt
        process.env.JWT_SECRET, // secret string
        {expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

//creating and sending token function
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    // define cookie options
    const cookiePotions =  {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production'){
        cookiePotions.secure = true
    };

    // create cookie and send to user
    res.cookie('jwt', token, cookiePotions);
    // remove the password from the output
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
};

exports.signup = catchAsync(async (req, res, next) => {
const newUser = await User.create({
    // only allow the needed data to be pu into the new User
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    /* passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    active: req.body.active */
});
// LAST LECTURE OF THE DAY
createSendToken(newUser, 201, res);
});

exports.loggin = catchAsync(async(req, res, next) => {
    const { email, password} = req.body;

    //1.  check if email and password exist
    if (!email || !password) {
        return next( new AppError(`Please provide your email and password`, 400));
    }

    //2.  check if the user exist and the password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password, Please check the details again', 401));
    }
    //3. createSendToken(user, 201, res);
    createSendToken(user, 200, res);
});

// a middleware to check if a person is logged in before accessing a particular resource
exports.protect = catchAsync(async (req, res, next) => {
    //1. Get the token and check if it exists
    let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
            ) {
            token = req.headers.authorization.split(' ')[1]; // split the authorization header and take the second part, and assign it to token variable
        }

        if (!token) { // if the token doest not exist, we end an error
            return next(new AppError('You are not logged in. Please log in to get access', 401));
        }

    //2. validate the token - verification
    //node js promisify  has been used to convert the jwt.verify() to a 
    //promise-based function, from the default callback-based function
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3. check if the user aceessing the route still exists
    // the decoded has the payload, which  in this case is the id, when the token is created, and when the token is to expire.
    // we use the id in this token to check if the user still exists.
        const refreshedUser = await User.findById(decoded.id); 
        if (!refreshedUser) {
            return next(new AppError(
                'The user nolonger exists',
                401
                )
            );
        }

    // check if the user changed password after token was isssued - use instance method:
    // using an instance variable that takes in the JWTTime stamp, and compares with the password change time if any
        if (refreshedUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('You recently changed your Password, Please login again', 401)
            );
        }
        // if the user makes it up to this point, we grant access to the protected route
        req.user = refreshedUser;
    next();
});
            // AUTHORIZATION
// restrict certain operations to lead-guide and admin roles
// we cannot pass arguments into a middleware function
// so we create a wrapper function that will then return the middleware function
exports.restrictTo=(...roles) => {
    return (req, res, next) => {
        // roles is an array ['admin', 'lead-guide'] - they are allowed to perfom deleting operation
        // if the user role is not specified in this array, then they are not allowed to perform this function
        if (!roles.includes(req.user.role)) {
            return next( new AppError('You do not have permission to perform this action', 403)
            );
        }
        next()
    }
}

// forgot password prompt password 
exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1. get user by posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user){ // verify if the user exists 
        return next( new AppError('there is no user with such email, Sign Up  instead', 404));
    }
    //2. generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });

    //3. send token to user via email
    const resetURL = `${req.protocol}://${req.get(
        'host'
        )}/api/v1/users/reset-password/${resetToken}`

    const message = `Submit your new password, and its confirmation to the link: ${resetURL}\n If you did not forget your password, you can ignore this email.`;
    try {
        await sendEmail({
            email: user.email, // slight variation
            subject: 'Password Reset Token: exires in 10 minutes',
            message
        });
            // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            message: "token sent to email"
        });
    } catch (error) {
        // reset the properties and not to save them in the DB
        user.createPasswordResetToken = undefined;
        user.passwordResetExpiresIn = undefined;
        await user.save({validateBeforeSave: false});
            // send an error message to the client
        return next(new AppError('There was an error sending your password reset email, please try again later', 500))
    }
})

// reset password prompt
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1. GET USER BASED ON TOKEN
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
        // find user based on hashed reset token and resret expiry in DB
    const user =await User.findOne(
        {passwordResetToken: hashedToken,
        passwordResetExpiresIn: { $gt: Date.now()}
    });

    // 2. IF THE USER EXISTS AND TOKEN HAS NOT EXPIRED, SET THE NEW PASSWORD
    if (!user){
        return next(new AppError('Token is invalid or has expired'))
    }
    // get the new password, and passwordConfirm
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    // delete reset token and expiration time from DB
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;

    //save the new details
    await user.save();

    // LOG THE USER IN
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
        // GET THE USER FROM THE COLLECION
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return next(new AppError('Your account does not exist!', 404));
        }
        // CHECK IF THE PROMPTED POSTED PASSWORD IS CORRECT
            if(!(await user.correctPassword(req.body.currentPassword, user.password))) {
                return next(new AppError('Your input password is wrong', 401));
            }
        // IF THE POSTED PASSWORD IS CORRECT, UPDATE THE PASSWORD
            user.password = req.body.password;
            user.passwordConfirm = req.body.passwordConfirm;
            await user.save();
        // LOG THE USER IN
    createSendToken(user, 200, res);
});