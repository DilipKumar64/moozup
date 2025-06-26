const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/auth.middleware');
const newsController = require('../controllers/news.controller');
const uploadFields = require('../middlewares/upload.middleware2');

// Create a news post (with up to 10 images)
router.post('/', authenticateJWT, uploadFields.newsPostImages, newsController.createNewsPost);

// Delete a news post
router.delete('/:id', authenticateJWT, newsController.deleteNewsPost);

// Like or unlike a news post
router.post('/:id/like', authenticateJWT, newsController.likeOrUnlikeNewsPost);

// Increment share count
router.post('/:id/share', authenticateJWT, newsController.incrementShareCount);

// Comment on a post (top-level)
router.post('/:id/comment', authenticateJWT, newsController.createNewsComment);

// Reply to a comment (only to top-level)
router.post('/comment/:commentId/reply', authenticateJWT, newsController.replyToNewsComment);

// Like or unlike a comment
router.post('/comment/:commentId/like', authenticateJWT, newsController.likeOrUnlikeNewsComment);

// Get all news posts for an event with pagination
router.get('/event/:eventId', newsController.getNewsPostsByEvent);

module.exports = router; 