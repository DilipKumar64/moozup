const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/auth.middleware");
const { upload, handleMulterError } = require("../middlewares/upload.middleware");
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
  getExhibitorTypesByEvent,
  createDirectoryUser,
  updateDirectoryUser,
  deleteDirectoryUser,
  updateUserNote,
  sendUserPassword,
  getUserByEmail,
  getEventUsers
} = require('../controllers/directory.controller');
const uploadFields = require("../middlewares/upload.middleware2");

// Participation Type Routes
router.post('/participation-types', authenticateJWT, createParticipationType);
router.put('/participation-types/:id', authenticateJWT, updateParticipationType);
router.delete('/participation-types/:id', authenticateJWT, deleteParticipationType);
router.put('/participation-types/:id/visibility', authenticateJWT, updateVisibility);
router.put('/participation-types/:id/event-allowance', authenticateJWT, updateEventAllowance);
router.get('/participation-types/event/:eventId', authenticateJWT, getParticipationTypesByEvent);

// Sponsor Type Routes
router.post('/sponsor-types', authenticateJWT, createSponsorType);
router.put('/sponsor-types/:id', authenticateJWT, updateSponsorType);
router.delete('/sponsor-types/:id', authenticateJWT, deleteSponsorType);
router.get('/sponsor-types/event/:eventId', authenticateJWT, getSponsorTypesByEvent);

// Exhibitor Type Routes
router.post('/exhibitor-types', authenticateJWT, createExhibitorType);
router.put('/exhibitor-types/:id', authenticateJWT, updateExhibitorType);
router.delete('/exhibitor-types/:id', authenticateJWT, deleteExhibitorType);
router.get('/exhibitor-types/event/:eventId', authenticateJWT, getExhibitorTypesByEvent);

// People routes
router.post('/people', authenticateJWT, uploadFields.profilePicture, handleMulterError, createDirectoryUser);
router.put('/people/:id', authenticateJWT, upload.single('profilePicture'), handleMulterError, updateDirectoryUser);
router.delete('/people/:id', authenticateJWT, deleteDirectoryUser);
router.patch('/people/note/:id', authenticateJWT, updateUserNote);
router.post('/people/send-password/:id', authenticateJWT, sendUserPassword);
router.get('/people/email/:email', getUserByEmail);
router.get('/people/event/:eventId', authenticateJWT, getEventUsers);

module.exports = router;