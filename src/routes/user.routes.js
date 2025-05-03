const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const authLimiter = require('../middlewares/userLimiter');
const userController = require('../controllers/user.controller'); // Importing authController

const router = express.Router();

// Get user profile by ID
router.get("/profile/:id",authLimiter, authenticateJWT, userController.getProfileById);

// Update user profile
router.put("/profile/:id", authLimiter, authenticateJWT, userController.updateProfile);

// Delete user account
router.delete("/delete/:id", authLimiter, authenticateJWT, userController.deleteAccount);

module.exports = router;