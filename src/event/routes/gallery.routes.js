const express = require('express');
const authenticateJWT = require('../../middlewares/auth.middleware');
const galleryController = require('../controllers/gallery.controller');
const uploadFields = require('../../middlewares/upload.middleware2');

const router = express.Router();

router.post('/createGallery', uploadFields.Gallery, authenticateJWT, galleryController.uploadGalleryItem);
router.get('/getGallery', authenticateJWT, galleryController.fetchGalleryItems);
router.delete("/deleteGalleryItems/:id",galleryController.deleteGalleryItem)

module.exports = router;
