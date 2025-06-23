const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middlewares/auth.middleware');
const sessionTypeController = require('../controllers/agenda.controller');
const sessionController = require('../controllers/agenda.controller');

const multer = require('multer');



// Middleware to handle multipart/form-data
router.use(multer().none()); // You can adjust the multer configuration as needed


// session type routes
router.post('/createSessionType',authenticateJWT, sessionTypeController.createSessionType);
router.get('/getAllSessionTypes/:eventId',authenticateJWT, sessionTypeController.GetAllSessionTypes);
router.get('/getSessionTypeById/:id',authenticateJWT, sessionTypeController.GetSessionTypeById);
router.put('/updateSessionType/:id',authenticateJWT, sessionTypeController.UpdateSessionType);
router.delete('/deleteSessionType/:id',authenticateJWT, sessionTypeController.DeleteSessionTypeById);






// session routes
router.post('/createSession',authenticateJWT, sessionController.createSession);
router.get('/getAllSessions/:eventId',authenticateJWT, sessionController.getAllSessions);
router.put('/updateSession/:id',authenticateJWT, sessionController.updateSession);
router.get('/getSessionById/:id',authenticateJWT, sessionController.getSessionById);
router.delete('/deleteSession/:id',authenticateJWT, sessionController.deleteSession);




// award Type routes
router.post('/createAwardType',authenticateJWT, sessionController.createAwardType);
router.get('/getAllAwardTypes',authenticateJWT, sessionController.getAllAwardTypes);
router.get('/getAwardTypeById/:id',authenticateJWT, sessionController.getAwardTypeById);
router.put('/updateAwardType/:id',authenticateJWT, sessionController.updateAwardType);
router.delete('/deleteAwardType/:id',authenticateJWT, sessionController.deleteAwardTypeById);



// award People routes
router.post('/createAwardedPerson',authenticateJWT, sessionController.createAwardedPerson);
router.get('/getAllAwardedPersons',authenticateJWT, sessionController.getAllAwardedPersons);
router.get('/getAwardedPersonById/:id',authenticateJWT, sessionController.getAwardedPersonById);
router.put('/updateAwardedPerson/:id',authenticateJWT, sessionController.updateAwardedPerson);
router.delete('/deleteAwardedPerson/:id',authenticateJWT, sessionController.deleteAwardedPersonById);


module.exports = router;