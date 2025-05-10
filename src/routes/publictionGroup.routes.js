const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const publictionGroupController = require('../controllers/publictiongroup.controller');
const router = express.Router();


router.post('/createPublicationGroup', authenticateJWT, publictionGroupController.creayteNewPublicationGroup);
router.get('/getAllPublicationGroup', authenticateJWT, publictionGroupController.getAllPublicationGroup);


module.exports = router;