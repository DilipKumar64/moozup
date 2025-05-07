const { deleteFromSupabase } = require("../utils/supabaseImageUtils"); // image delete helper
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
const uploadToSupabase = require("../utils/uploadToSupabase");

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const {
      eventName,
      eventDescription,
      eventStartDate,
      eventEndDate,
      startTime,
      endTime,
      eventLocation,
      moozupWebsite,
      eventWebsite,
      facebookId,
      facebookPageUrl,
      twitterId,
      twitterPageUrl,
      twitterHashtag,
      linkedInPageUrl,
      meraEventsId,
      ticketWidget,
      streamUrl,
      logo,
      banner,
      creatorId,
      categoryId, // Optional
    } = req.body;

    // ✅ Required Field Validation
    if (
      !eventName ||
      !eventDescription ||
      !eventStartDate ||
      !eventEndDate ||
      !startTime ||
      !endTime ||
      !eventLocation ||
      !moozupWebsite ||
      !eventWebsite ||
      !facebookId ||
      !facebookPageUrl ||
      !twitterId ||
      !twitterPageUrl ||
      !twitterHashtag ||
      !linkedInPageUrl ||
      !meraEventsId ||
      !ticketWidget ||
      !streamUrl ||
      !creatorId
    ) {
      return res.status(400).json({
        message: "All required fields must be provided.",
      });
    }

    const logoUrl = await uploadToSupabase(req.files.logo[0], "logos");
    const bannerUrl = await uploadToSupabase(req.files.banner[0], "banners");

    const newEvent = await createEvent({
      eventName,
      eventDescription,
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      startTime,
      endTime,
      eventLocation,
      moozupWebsite,
      eventWebsite,
      facebookId,
      facebookPageUrl,
      twitterId,
      twitterPageUrl,
      twitterHashtag,
      linkedInPageUrl,
      meraEventsId,
      ticketWidget,
      streamUrl,
      logo: logoUrl,
      banner: bannerUrl,
      creatorId: Number(creatorId),
      categoryId: categoryId ? Number(categoryId) : undefined,
    });

    return res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
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

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const { logo, banner } = req.files; // Get uploaded files

  // ✅ Fix: Convert strings to Date objects
  if (updatedData.eventStartDate) {
    updatedData.eventStartDate = new Date(updatedData.eventStartDate);
  }

  if (updatedData.eventEndDate) {
    updatedData.eventEndDate = new Date(updatedData.eventEndDate);
  }

  try {
    // Fetch existing event to get the current logo/banner URLs
    const existingEvent = await findEventById(id);

    let logoUrl = existingEvent.logo;
    let bannerUrl = existingEvent.banner;

    // If a new logo is uploaded, upload it and delete the old one
    if (logo) {
      logoUrl = await uploadToSupabase(
        logo[0],
        "event-logos",
        existingEvent.logo
      ); // Pass the old logo URL for deletion
    }

    // If a new banner is uploaded, upload it and delete the old one
    if (banner) {
      bannerUrl = await uploadToSupabase(
        banner[0],
        "event-banners",
        existingEvent.banner
      ); // Pass the old banner URL for deletion
    }

    // Now, update the event with new logo/banner URLs and other data
    updatedData.logo = logoUrl;
    updatedData.banner = bannerUrl;

    // Update event in the database
    const updatedEvent = await updateEventById(id, updatedData);

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res
      .status(500)
      .json({ message: "Error updating event", error: error.message });
  }
};

// Delete Event

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get existing event to fetch logo and banner URLs
    const existingEvent = await findEventById(id);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 2. Delete logo and banner from Supabase
    if (existingEvent.logo) {
      await deleteFromSupabase(existingEvent.logo);
    }

    if (existingEvent.banner) {
      await deleteFromSupabase(existingEvent.banner);
    }

    // 3. Now delete the event from database
    const deletedEvent = await deleteEventById(id);

    res.status(200).json({
      message: "Event and images deleted successfully",
      event: deletedEvent,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
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
