const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const galleryController = require('../controllers/gallery.controller');

const router = express.Router();

router.post('/createGallery', authenticateJWT, galleryController.uploadItem); // single route for image/video with optional group
router.get('/getGallery', authenticateJWT, galleryController.fetchGalleryItems); // single route for image/video with optional group

module.exports = router;