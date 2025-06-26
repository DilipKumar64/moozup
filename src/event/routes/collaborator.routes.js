const express = require('express');
const multer = require('multer');
const authenticateJWT = require('../../middlewares/auth.middleware');
const collboratorController = require('../controllers/collaborator.controller');
const router = express.Router();

// Middleware to handle multipart/form-data (if needed)
router.use(multer().none());


router.post('/CreateCollaborator',authenticateJWT,collboratorController.createCollaborator);
router.get('/GetAllCollaborators',authenticateJWT,collboratorController.getAllCollaborators);
router.delete('/DeleteCollaborator/:id',authenticateJWT,collboratorController.deleteCollaborator);

module.exports = router;