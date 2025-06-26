const express = require('express')
const socialwallPostController = require('../controllers/socialwallPost.controller')
const authenticateJWT = require('../../middlewares/auth.middleware')

const router = express.Router()

router.post('/create', socialwallPostController.createSocialWallPost)
router.get('/post/:eventId',authenticateJWT, socialwallPostController.getEventSocialWallPosts)
router.get('/:postId', authenticateJWT, socialwallPostController.getSocialPostById)

router.post('/post/like', authenticateJWT, socialwallPostController.likePost)


module.exports = router;