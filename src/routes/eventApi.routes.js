const express = require("express");
const eventController = require("../controllers/eventApi.controller");
const authenticateJWT = require("../middlewares/auth.middleware");
const uploadFields = require("../middlewares/upload.middleware2");

const staticContentController = require("../controllers/eventApi.controller");


const router = express.Router();

// POST route to create an event
router.post("/createEvent",authenticateJWT,uploadFields.eventMedia, eventController.createEvent); // POST route to create an event
router.get("/getEvent", authenticateJWT, eventController.getEvents); // GET route to fetch all events
router.get("/event/details/:id", eventController.getEventDetails); // GET route to fetch single event
router.put("/updateEvent/:id",uploadFields.eventMedia, authenticateJWT, eventController.updateEvent); // PUT route to update an event
router.delete("/deleteEvent/:id", authenticateJWT, eventController.deleteEvent); // DELETE route to delete an event
router.post("/join/:eventId", authenticateJWT, eventController.joinEvent); // POST route to join an event
router.post("/leave/:eventId", authenticateJWT, eventController.leaveEvent); // POST route to leave an event
router.get("/my-events", eventController.getMyEvents);
router.post("/report/:id", authenticateJWT, eventController.reportEvent);
router.post("/rsvp/:id", authenticateJWT, eventController.rsvpEvent); // POST route to RSVP to an event
router.get("/attendees/:id", authenticateJWT, eventController.listAttendees); // GET route to fetch attendees of an event









// static page routes
router.post('/CreateFaq',authenticateJWT, staticContentController.createFAQs);
router.post('/CreateEventInfo',authenticateJWT, staticContentController.createEventInfo);
router.post('/CreateQuestionnaire',authenticateJWT, staticContentController.createQuestionnaire);
router.post('/createStaticContent1',authenticateJWT, staticContentController.createStaticContent1);
router.post('/createStaticContent2',authenticateJWT, staticContentController.createStaticContent2);
router.post('/createStaticContent3',authenticateJWT, staticContentController.createStaticContent3);
router.post('/createStaticContent4',authenticateJWT, staticContentController.createStaticContent4);
router.post('/createStaticContent5',authenticateJWT, staticContentController.createStaticContent5);
router.post('/createStaticContent6',authenticateJWT, staticContentController.createStaticContent6);
router.post('/createStaticContent7',authenticateJWT, staticContentController.createStaticContent7);
router.post('/createNonMenuStaticContent1',authenticateJWT, staticContentController.NonMenuStaticContent1);
router.post('/createNonMenuStaticContent2',authenticateJWT, staticContentController.NonMenuStaticContent2);
router.post('/createNonMenuStaticContent3',authenticateJWT, staticContentController.NonMenuStaticContent3);
router.post('/createNonMenuStaticContent4',authenticateJWT, staticContentController.NonMenuStaticContent4);
router.post('/createNonMenuStaticContent5',authenticateJWT, staticContentController.NonMenuStaticContent5);




module.exports = router;
