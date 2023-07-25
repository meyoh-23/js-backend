const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

//ROUTEr
const router = express.Router();

// NEW ROUTERS - creating users section
// signup
router.post('/signup', authController.signup);
router.post('/loggin', authController.loggin);

// forgot password and reset password routes
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// update password - withoud forgetiing this time
router.patch(
    '/update-my-password',
    authController.protect,
    authController.updatePassword
    );

// updating my profile
router.patch('/update-my-info',
authController.protect,
userController.updateMe);

//deactivating my account
router.delete('/deactivate-my-account',
authController.protect,
userController.deleteMe);


// routing users from 61
router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);

module.exports = router;