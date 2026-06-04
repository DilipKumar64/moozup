const express = require('express');
const authenticateJWT = require('../middlewares/auth.middleware');

const {getEventData,getContacts} = require("../controllers/mobile.controller")

const router = express.Router();

// Get event data for mobile app
router.get("/event-data", authenticateJWT,getEventData);

router.get('/contacts', authenticateJWT,getContacts);

module.exports = router; 