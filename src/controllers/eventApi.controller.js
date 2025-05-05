const prisma = require("../config/prisma");
const {
  createEvent,
  findAllEvents,
  findEventById,
  updateEventById,
  deleteEventById,
  joinEvent,
  leaveEvent,
  getEventsByCreatorId,
  reportEvent,
  rsvpToEvent,
  getAttendees,
} = require("../models/eventModel"); // Import model function

// Create Event
exports.createEvent = async (req, res) => {
  const {
    title,
    eventCategory,
    eventName,
    eventDescription,
    logo,
    banner,
    eventStartDate,
    eventEndDate,
    isPrivateEvent,
    address1,
    address2,
    city,
    state,
    country,
    zipCode,
    hostOrganizationName,
    hostOrganizationDescription,
    hostWebsiteUrl,
    eventUrl,
    isActive,
    isPublished,
    isFreeEvent,
    markDelete,
    sponsorLogoPath,
    creatorId,
  } = req.body;

  // Input validation
  if (
    !title ||
    !eventCategory ||
    !eventName ||
    !eventDescription ||
    !creatorId ||
    !eventStartDate ||
    !eventEndDate ||
    !address1 ||
    !city ||
    !state ||
    !country ||
    !zipCode ||
    !hostOrganizationName ||
    !eventUrl ||
    !logo ||
    !banner ||
    !hostOrganizationDescription ||
    !hostWebsiteUrl ||
    !isPrivateEvent ||
    !isActive ||
    !isPublished ||
    !isFreeEvent ||
    !markDelete ||
    !sponsorLogoPath
  ) {
    return res.status(400).json({ message: "All required fields are missing" });
  }

  // Convert creatorId to an integer
  const parsedCreatorId = Number(creatorId); // Convert to integer

  // Check if creatorId is valid
  if (isNaN(parsedCreatorId)) {
    return res.status(400).json({ message: "Invalid creatorId" });
  }

  try {
    // Create the event using Prisma ORM
    const newEvent = await createEvent({
      title,
      eventCategory,
      eventName,
      eventDescription,
      logo,
      banner,
      eventStartDate: new Date(eventStartDate), // Ensure date is in correct format
      eventEndDate: new Date(eventEndDate), // Ensure date is in correct format
      isPrivateEvent: isPrivateEvent || false,
      address1,
      address2,
      city,
      state,
      country,
      zipCode,
      hostOrganizationName,
      hostOrganizationDescription,
      hostWebsiteUrl,
      eventUrl,
      isActive: isActive || true,
      isPublished: isPublished || false,
      isFreeEvent: isFreeEvent || false,
      markDelete: markDelete || false,
      dateTimeCreated: new Date(),
      createdBy: parsedCreatorId,
      dateTimeModified: new Date(),
      modifiedBy: parsedCreatorId,
      sponsorLogoPath,
      creatorId: parsedCreatorId, // Use parsed creatorId
    });

    // Return success response with created event
    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    // Error handling
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

//get events
exports.getEvents = async (req, res) => {
  try {
    const events = await findAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Get Event Details by ID
exports.getEventDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await findEventById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Error fetching event details" });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  // ✅ Fix: Convert string to Date object if date exists
  if (updatedData.date) {
    updatedData.date = new Date(updatedData.date);
  }

  try {
    const updatedEvent = await updateEventById(id, updatedData);
    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await deleteEventById(id);
    res.status(200).json({
      message: "Event deleted successfully",
      event: deletedEvent,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
};

exports.joinEvent = async (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.eventId; // Extracting eventId from URL params

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await joinEvent(userId, eventId); // Pass the eventId correctly
    res.status(200).json({
      message: "User joined event successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.leaveEvent = async (req, res) => {
  const { userId } = req.body;
  const eventId = req.params.eventId;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await leaveEvent(userId, eventId);
    res.status(200).json({
      message: "User left event successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error leaving event:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    console.log("Request Query:", req.query); // Log the query parameters
    const userId = parseInt(req.query.userId);

    if (!userId) {
      return res.status(400).json({
        error: "userId is required in the query parameters.",
      });
    }

    const events = await getEventsByCreatorId(userId);

    if (events.length === 0) {
      return res.status(404).json({
        message: "No events found created by the user.",
      });
    }

    return res.status(200).json({
      message: "Events fetched successfully.",
      data: events,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error for more information
    return res.status(500).json({
      error: "Error while fetching the events: " + error.message,
    });
  }
};

exports.reportEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ message: "Reason is required to report an event." });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found. Cannot report a non-existent event.",
      });
    }

    const report = await reportEvent(eventId, userId, reason);

    res.status(201).json({
      message: "Event reported successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Error reporting event:", error);
    return res.status(500).json({
      message: "An error occurred while reporting the event.",
      error: error.message,
    });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    const rsvp = await rsvpToEvent(eventId, userId);

    res.status(201).json({
      message: "RSVP successful.",
      data: rsvp,
    });
  } catch (error) {
    console.error("RSVP error:", error.message);
    res.status(400).json({
      message: error.message || "An error occurred.",
    });
  }
};

exports.listAttendees = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id); // Get the eventId from the URL parameter
    const attendees = await getAttendees(eventId);

    if (attendees.length === 0) {
      return res.status(404).json({
        message: "No attendees found for this event.",
      });
    }

    res.status(200).json({
      message: "Attendees fetched successfully.",
      data: attendees,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).json({
      message: "An error occurred while fetching the attendees.",
      error: error.message,
    });
  }
};
