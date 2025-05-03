const express = require('express')
const eventController = require("../controllers/eventApiController");
const authenticateJWT = require('../middlewares/auth.middleware');
const multer = require('multer')

const router = express.Router()
router.use(multer().none()) // Middleware to handle multipart/form-data

// POST route to create an event
router.post("/createEvent",authenticateJWT, eventController.createEvent); // POST route to create an event
router.get("/getEvent",  eventController.getEvents); // GET route to fetch all events
router.get("/event/details/:id",  eventController.getEventDetails); // GET route to fetch single event
router.put("/updateEvent/:id", authenticateJWT, eventController.updateEvent); // PUT route to update an event
router.delete("/deleteEvent/:id", authenticateJWT, eventController.deleteEvent); // DELETE route to delete an event


module.exports = router