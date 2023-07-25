const mongoose = require('mongoose');
const validator = require( 'validator'); // validate emails
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // built-in node module

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pease provide your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'admin'
    },
    password: {
        type: String,
        required: [true, 'Pease provide a password'],
        minlength: [8, 'Your password should be at least 8 characters long'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Pease Confirm your Password'],
        validate: {
            // Only works on save- only works on User.create() and User.save()
            validator: function(ell) {
                return ell === this.password; // checks if password === abc && passwordConfirm == abc
            },
            message: 'Passwords are not matching, Please check again before submiting'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresIn: Date,
    active:{
        type: Boolean,
        default: true,
        select: false
    }
});

// password encryprion
userSchema.pre('save', async function(next){
    // if password is not modified, meaning the initial password still exists and is thus already encrypted and saved in the databas
    if(!this.isModified('password')) {
        return next();
    }
    // encryption/ hashing password, cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined // to not passist the  item to the database
    next()
});

userSchema.pre('save', function(next){
    if (!this.isModified('password') || this.isNew){
        return next()
    };
    this.passwordChangedAt = Date.now() - 1000; // saving to DB may be slower than generation of jwt
    next();
});

//to aliminate deactivated account from being selected
// we want to return olny documents with active set to true
userSchema.pre(/^find/, async function(next) {
    this.find({active: {$ne: false}});
    next();
});

// instance method - methods that are available on all documents of a certain collection
// to check if the login password and the database password are matching
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(
        candidatePassword,
        userPassword
        )
}
//another instance method
// checks if the user recently changed the password
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        // convert passwordChangedAt to, miliseconds, then to seconds, and then to an integer, with a base of ten 
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000,
        10
        );
        //console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp; // return false by default
    }
    return false;
};

// password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // hash the passwordResetToken, and storing in the database
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    // console.log({resetToken}, this.passwordResetToken) /// KEEP CHECKING HERE
    this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;
    return resetToken; // returns the unencrypted version, which will be sent to the client
};


const User = mongoose.model('User', userSchema);

module.exports = User