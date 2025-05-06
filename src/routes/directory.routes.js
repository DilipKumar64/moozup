const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/auth.middleware");
const {
  createParticipationType,
  updateParticipationType,
  deleteParticipationType,
  updateVisibility,
  updateEventAllowance,
  getParticipationTypesByEvent,
  createSponsorType,
  updateSponsorType,
  deleteSponsorType,
  getSponsorTypesByEvent,
  createExhibitorType,
  updateExhibitorType,
  deleteExhibitorType,
  getExhibitorTypesByEvent

} = require('../controllers/directory.controller');


// Participation Type Routes
router.post('/participation-types', authenticateJWT, createParticipationType);
router.put('/participation-types/:id', authenticateJWT, updateParticipationType);
router.delete('/participation-types/:id', authenticateJWT, deleteParticipationType);
router.patch('/participation-types/:id/visibility', authenticateJWT, updateVisibility);
router.patch('/participation-types/:id/event-allowance', authenticateJWT, updateEventAllowance);
router.get('/events/:eventId/participation-types', authenticateJWT, getParticipationTypesByEvent);

// Sponsor Type Routes
router.post('/sponsor-types', authenticateJWT, createSponsorType);
router.put('/sponsor-types/:id', authenticateJWT, updateSponsorType);
router.delete('/sponsor-types/:id', authenticateJWT, deleteSponsorType);
router.get('/events/:eventId/sponsor-types', authenticateJWT, getSponsorTypesByEvent);

// Exhibitor Type Routes
router.post('/exhibitor-types', authenticateJWT, createExhibitorType);
router.put('/exhibitor-types/:id', authenticateJWT, updateExhibitorType);
router.delete('/exhibitor-types/:id', authenticateJWT, deleteExhibitorType);
router.get('/events/:eventId/exhibitor-types', authenticateJWT, getExhibitorTypesByEvent);

module.exports = router;