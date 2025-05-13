const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const authLimiter = require('../middlewares/userLimiter');
const userController = require('../controllers/auth.controller');

const router = express.Router();

// Signup and login routes
router.post('/signup', authLimiter, userController.signup);
router.post('/login', authLimiter, userController.login);

// Logout route
router.post('/logout', userController.logout); // Using the logout method from userController

// Refresh token route (no authentication required)
router.post("/refresh-token",authLimiter, userController.refreshToken);  

// Password reset route (protected)
router.post('/reset-password/:userId', authLimiter, authenticateJWT, userController.resetPassword);

module.exports = router;
 