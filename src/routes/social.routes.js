const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/auth.middleware');
const socialController = require('../controllers/social.controller');
const uploadFields = require('../middlewares/upload.middleware2');

// Create a social post (with up to 10 images)
router.post('/', authenticateJWT, uploadFields.newsPostImages, socialController.createSocialPost);

// Delete a social post
router.delete('/:id', authenticateJWT, socialController.deleteSocialPost);

// Like or unlike a social post
router.post('/:id/like', authenticateJWT, socialController.likeOrUnlikeSocialPost);

// Increment share count
router.post('/:id/share', authenticateJWT, socialController.incrementShareCount);

// Comment on a post (top-level)
router.post('/comment', authenticateJWT, socialController.createSocialComment);

// Reply to a comment (only to top-level)
router.post('/comment/:commentId/reply', authenticateJWT, socialController.replyToSocialComment);

// Like or unlike a comment
router.post('/comment/:commentId/like', authenticateJWT, socialController.likeOrUnlikeSocialComment);

// Get all social posts for an event with pagination
router.get('/event/:eventId', socialController.getSocialPostsByEvent);

module.exports = router; 