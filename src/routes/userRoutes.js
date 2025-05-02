const express = require('express');
const userController = require('../controllers/userControllers'); // Importing authController
const authenticateJWT = require('../middlewares/userMiddleware');
const authLimiter = require('../middlewares/userLimiter');

const router = express.Router();

// Signup and login routes
router.post('/signup', authLimiter, userController.signup);
router.post('/login', authLimiter, userController.login);

// Logout route
router.post('/logout', userController.logout); // Using the logout method from userController

router.post("/refresh-token", userController.refreshToken);  

// Protected profile route
router.get("/profile", authenticateJWT, (req, res) => {
    res.status(200).json({
      message: "Welcome to your profile!",
      user: req.user, // This is the user data decoded from the JWT
    });
});

module.exports = router;
