const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');

// fitering objects before allowing update
const filteredObj =(obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    })
    return newObj;
}

// get all users function
exports.getAllUsers = catchAsync(async(req, res, next) => {
    const users = await User.find();

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

// the user to update his/ her details
exports.updateMe = catchAsync(async (req, res, next)=> {
    //1.  create an error if the user tries updating a password
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError('Your cannot edit your password here, Please go to the appropriate section to change password', 400));
    }
    // 2. filtering unwanted fields from the request body
    const filteredBody = filteredObj(req.body, 'name', 'email');
    // updating the user
    const updatedUser =await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });
    // send response
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// deactivate an account
exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false}, {new: true});

    // send response
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This Route is not yet defined"
    })
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This Route is not yet defined"
    })
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This Route is not yet defined"
    })
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This Route is not yet defined"
    })
}