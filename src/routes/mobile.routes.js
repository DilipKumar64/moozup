const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');
const mobileController = require('../controllers/mobile.controller');

const router = express.Router();

// Get event data for mobile app
router.get("/event-data", authenticateJWT, mobileController.getEventData);

module.exports = router; 