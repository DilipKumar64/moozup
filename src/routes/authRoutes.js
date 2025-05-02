const express = require('express');
const authController = require('../controllers/authControllers'); // Importing authController
const authenticateJWT = require('../middlewares/authMiddleware');
const authLimiter = require('../middlewares/authLimiter');

const router = express.Router();

// Signup and login routes
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);

// Logout route
router.post('/logout', authController.logout); // Using the logout method from authController

router.post("/refresh-token", authController.refreshToken);  

// Protected profile route
router.get("/profile", authenticateJWT, (req, res) => {
    res.status(200).json({
      message: "Welcome to your profile!",
      user: req.user, // This is the user data decoded from the JWT
    });
});

module.exports = router;
