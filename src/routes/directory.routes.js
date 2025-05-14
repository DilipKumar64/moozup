const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/auth.middleware");
const { upload, documentUpload, handleMulterError } = require("../middlewares/upload.middleware");
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
  getEventUsers,
  getUsersByParticipationType,
  bulkDeleteUsers,
  bulkUpdateDisplayOrder,
  updateUserDisplayOrder,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  addSponsorPersons,
  uploadSponsorDocument,
  bulkUpdateSponsorDisplayOrder,
  updateSponsorDisplayOrder,
  getAllSponsors,
  createExhibitor,
  updateExhibitor,
  addExhibitorPersons,
  uploadExhibitorDocument,
  getExhibitorById,
  getEventExhibitors,
  deleteExhibitor,
  createParticipationTypeSetting,
  updateParticipationTypeSetting,
  getParticipationTypeSettings,
  deleteParticipationTypeSetting,
  updateParticipationTypeAttribute,
  createInterestCategory,
  updateInterestCategoryTitle,
  getInterestCategoriesByEvent,
  getInterestCategoryById,
  deleteInterestCategory,
  createInterestArea,
  updateInterestArea,
  getInterestAreasByEvent,
  getInterestAreaById,
  deleteInterestArea,
  getAllParticipationTypes,
  getSponsorTypes,
  findAllUser
} = require('../controllers/directory.controller');
const uploadFields = require("../middlewares/upload.middleware2");

// Participation Type Routes
router.post('/participation-types', authenticateJWT, createParticipationType);
router.put('/participation-types/:id', authenticateJWT, updateParticipationType);
router.delete('/participation-types/:id', authenticateJWT, deleteParticipationType);
router.put('/participation-types/:id/visibility', authenticateJWT, updateVisibility);
router.put('/participation-types/:id/event-allowance', authenticateJWT, updateEventAllowance);
router.get('/participation-types/event/:eventId', authenticateJWT, getParticipationTypesByEvent);
router.get("/get-all-participation",authenticateJWT,getAllParticipationTypes)


// Participation Type Settings Routes
router.post('/participation-type-settings', authenticateJWT, createParticipationTypeSetting);
router.put('/participation-type-settings/:id', authenticateJWT, updateParticipationTypeSetting);
router.get('/participation-type-settings/event/:eventId', authenticateJWT, getParticipationTypeSettings);
router.delete('/participation-type-settings/:id', authenticateJWT, deleteParticipationTypeSetting);
router.patch('/participation-types/:id/attribute', authenticateJWT, updateParticipationTypeAttribute);

// Sponsor Type Routes
router.post('/sponsor-types', authenticateJWT, createSponsorType);
router.put('/sponsor-types/:id', authenticateJWT, updateSponsorType);
router.delete('/sponsor-types/:id', authenticateJWT, deleteSponsorType);
router.get('/sponsor-types/event/:eventId', authenticateJWT, getSponsorTypesByEvent);
router.get("/findAllSponsor-types",authenticateJWT,getSponsorTypes)

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
router.get('/people/participation-type/:participationTypeId', authenticateJWT, getUsersByParticipationType);
router.post('/people/bulk-delete', authenticateJWT, bulkDeleteUsers);
router.post('/people/bulk-display-order', authenticateJWT, bulkUpdateDisplayOrder);
router.patch('/people/display-order/:id', authenticateJWT, updateUserDisplayOrder);
router.get('/allPeople', authenticateJWT, findAllUser);

// Sponsor routes
router.get('/sponsors', authenticateJWT, getAllSponsors);
router.post('/sponsors', authenticateJWT, upload.single('logo'), handleMulterError, createSponsor);
router.put('/sponsors/:id', authenticateJWT, upload.single('logo'), handleMulterError, updateSponsor);
router.delete('/sponsors/:id', authenticateJWT, deleteSponsor);
router.post('/sponsors/:id/persons', authenticateJWT, addSponsorPersons);
router.post('/sponsors/:id/documents', authenticateJWT, documentUpload.single('document'), handleMulterError, uploadSponsorDocument);
router.post('/sponsors/bulk-display-order', authenticateJWT, bulkUpdateSponsorDisplayOrder);
router.patch('/sponsors/:id/display-order', authenticateJWT, updateSponsorDisplayOrder);

// Exhibitor routes
router.post('/exhibitors', authenticateJWT, upload.single('logo'), handleMulterError, createExhibitor);
router.put('/exhibitors/:id', authenticateJWT, upload.single('logo'), handleMulterError, updateExhibitor);
router.post('/exhibitors/:id/persons', authenticateJWT, addExhibitorPersons);
router.post('/exhibitors/:id/documents', authenticateJWT, documentUpload.single('document'), handleMulterError, uploadExhibitorDocument);
router.get('/exhibitors/:id', authenticateJWT, getExhibitorById); //exhibitor by id
router.get('/exhibitors', authenticateJWT, getEventExhibitors); //all exhibitors
router.delete('/exhibitors/:id', authenticateJWT, deleteExhibitor); //delete exhibitor

// Interest Category routes
router.post('/interest-categories', authenticateJWT, createInterestCategory);
router.patch('/interest-categories/:id', authenticateJWT, updateInterestCategoryTitle);
router.get('/interest-categories/event/:eventId', authenticateJWT, getInterestCategoriesByEvent);
router.get('/interest-categories/:id', authenticateJWT, getInterestCategoryById);
router.delete('/interest-categories/:id', authenticateJWT, deleteInterestCategory);

// Interest Area routes
router.post('/interest-areas', authenticateJWT, createInterestArea);
router.patch('/interest-areas/:id', authenticateJWT, updateInterestArea);
router.get('/interest-areas/event/:eventId', authenticateJWT, getInterestAreasByEvent);
router.get('/interest-areas/:id', authenticateJWT, getInterestAreaById);
router.delete('/interest-areas/:id', authenticateJWT, deleteInterestArea);

module.exports = router;