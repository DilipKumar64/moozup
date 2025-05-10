const express = require('express');
const uploadFields = require('../middlewares/upload.middleware2');
const publicationItemController = require('../controllers/publicianItem.controller');
const authenticateJWT = require('../middlewares/auth.middleware');
const router = express.Router();


router.post('/UploadPublicationitem',authenticateJWT,uploadFields.publication,publicationItemController.uploadPublicationitem);
router.get('/getPublicationItems',authenticateJWT,publicationItemController.getPublicationItems);

module.exports = router;