const express = require("express");
const eventController = require("../controllers/eventApi.controller");
const authenticateJWT = require("../middlewares/auth.middleware");

const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage(); // ⬅️ Don't save to disk
const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);
// POST route to create an event
router.post(
  "/createEvent",
  authenticateJWT,
  uploadFields,
  eventController.createEvent
); // POST route to create an event
router.get("/getEvent", authenticateJWT, eventController.getEvents); // GET route to fetch all events
router.get("/event/details/:id", eventController.getEventDetails); // GET route to fetch single event
router.put("/updateEvent/:id",uploadFields, authenticateJWT, eventController.updateEvent); // PUT route to update an event
router.delete("/deleteEvent/:id", authenticateJWT, eventController.deleteEvent); // DELETE route to delete an event
router.post("/join/:eventId", authenticateJWT, eventController.joinEvent); // POST route to join an event
router.post("/leave/:eventId", authenticateJWT, eventController.leaveEvent); // POST route to leave an event
router.get("/my-events", eventController.getMyEvents);
router.post("/report/:id", authenticateJWT, eventController.reportEvent);
router.post("/rsvp/:id", authenticateJWT, eventController.rsvpEvent); // POST route to RSVP to an event
router.get("/attendees/:id", authenticateJWT, eventController.listAttendees); // GET route to fetch attendees of an event

module.exports = router;
