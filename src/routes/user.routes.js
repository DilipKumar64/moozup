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

//Get user’s joined/created events
// router.get("/events", authLimiter, authenticateJWT, userController.getEvents);

//Get user’s joined/created communities
// router.get("/communities", authLimiter, authenticateJWT, userController.getCommunities);

// Follow another user
router.post("/follow/:id", authLimiter, authenticateJWT, userController.followUser);

//Unfollow another user
// router.post("/unfollow/:id", authLimiter, authenticateJWT, userController.unfollowUser);

// /List user’s followers
// router.get("/followers", authLimiter, authenticateJWT, userController.getFollowers);

//List users followed by the user
// router.get("/following", authLimiter, authenticateJWT, userController.getFollowing);

//Report a user
// router.post("/report/:id", authLimiter, authenticateJWT, userController.reportUser);

module.exports = router;