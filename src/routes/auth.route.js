const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const authLimiter = require('../middlewares/userLimiter');
const userController = require('../controllers/auth.controller');

const router = express.Router();

// Signup and login routes
router.post('/signup',authLimiter , userController.signup);
router.post('/login', authLimiter, userController.login);

// Logout route
router.post('/logout', userController.logout); // Using the logout method from userController

// Refresh token route (no authentication required)
router.post("/refresh-token",authLimiter, userController.refreshToken);  

// Password reset route (protected)
// 1. Request OTP (email or phone se)
router.post('/request-reset-otp',authLimiter, userController.requestResetOtp);

// 2. Verify OTP
router.post('/verify-reset-otp',authLimiter, userController.verifyResetOtp);

// 3. Reset password after OTP verification
router.post('/reset-password',authLimiter, userController.resetPassword);

module.exports = router;
 