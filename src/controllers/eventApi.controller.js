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
  createStaticContent,
} = require("../models/eventModel"); // Import model function

const { getGalleryItems, deleteGalleryItem } = require("../models/galleryModel");
const { deleteParticipationTypesByEventId } = require("../models/participation.type.model");
const { deleteParticipationTypeSettingsByEventId } = require("../models/participation.type.setting.model");
const { getPublicationItemsByEventId, deletePublicationItemById } = require("../models/publicationItem.model");
const deleteFromSupabase = require("../utils/deleteFromSupabase");
const getCoordinatesFromLocation = require("../utils/geocodeLocation");
const getSupabasePath = require("../utils/getSupabasePath");
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

    const { latitude, longitude } = await getCoordinatesFromLocation(eventLocation);

    let logoUrl = null;
    let bannerUrl = null;

    if (req.files && req.files.logo && req.files.logo.length > 0) {
      logoUrl = await uploadToSupabase(req.files.logo[0], "logos");
    }

    if (req.files && req.files.banner && req.files.banner.length > 0) {
      bannerUrl = await uploadToSupabase(req.files.banner[0], "banners");
    }

    const newEvent = await createEvent({
      eventName,
      eventDescription,
      eventStartDate: new Date(eventStartDate),
      eventEndDate: new Date(eventEndDate),
      startTime,
      endTime,
      eventLocation,
      latitude,
      longitude,
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
      logoUrl = await uploadToSupabase(logo[0], "logos", existingEvent.logo); // Pass the old logo URL for deletion
    }

    // If a new banner is uploaded, upload it and delete the old one
    if (banner) {
      bannerUrl = await uploadToSupabase(
        banner[0],
        "banners",
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
    const existingEvent = await findEventById(id);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 🖼 Delete logo
    if (existingEvent.logo) {
      const logoPath = getSupabasePath(existingEvent.logo, "moozup");
      console.log("🖼 Deleting logo path:", logoPath);
      if (logoPath) await deleteFromSupabase("moozup", logoPath);
    }

    // 🖼 Delete banner
    if (existingEvent.banner) {
      const bannerPath = getSupabasePath(existingEvent.banner, "moozup");
      console.log("🖼 Deleting banner path:", bannerPath);
      if (bannerPath) await deleteFromSupabase("moozup", bannerPath);
    }

    // 📸 Delete gallery items and associated media
    const galleryItems = await getGalleryItems({ eventId: id });

    await Promise.all(
      galleryItems.map(async (item) => {
        if (item.imageUrl) {
          const imagePath = getSupabasePath(item.imageUrl, "moozup");
          console.log("🖼 Deleting gallery image:", imagePath);
          if (imagePath) await deleteFromSupabase("moozup", imagePath);
        }

        if (item.videoUrl) {
          const videoPath = getSupabasePath(item.videoUrl, "moozup");
          console.log("🎥 Deleting gallery video:", videoPath);
          if (videoPath) await deleteFromSupabase("moozup", videoPath);
        }

        await deleteGalleryItem(item.id);
      })
    );

    // 📄 Delete publication items (doc from Supabase + DB record)
    const publicationItems = await getPublicationItemsByEventId(id);

    await Promise.all(
      publicationItems.map(async (item) => {
      if (item.fileUrl) {
      const docPath = getSupabasePath(item.fileUrl, "moozup"); // ✅ bucket only
      console.log("📄 Deleting document path from Supabase:", docPath);

      if (docPath) {
        await deleteFromSupabase("moozup", docPath); // ✅ no extra folder prefix
      } else {
        console.warn("⚠️ docPath is null, skipping deleteFromSupabase");
      }
    }

        await deletePublicationItemById(item.id);
      })
    );

    // 🧾 Delete participation-related data
    await deleteParticipationTypeSettingsByEventId(id);
    await deleteParticipationTypesByEventId(id);

    // ❌ Finally delete the event
    const deletedEvent = await deleteEventById(id);

    return res.status(200).json({
      message: "Event and all linked data deleted successfully",
      event: deletedEvent,
    });

  } catch (error) {
    console.error("❌ Error deleting event:", error);
    return res.status(500).json({
      message: "Error deleting event",
      error: error.message,
    });
  }
};


// join event
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

exports.createFAQs = async (req, res) => {
  try {
    const { FAQs, eventId, userId } = req.body;
    if (!FAQs || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "FAQs, eventId, and userId are required" });
    }
    const result = await createStaticContent("FAQs", FAQs, eventId, userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEventInfo = async (req, res) => {
  try {
    const { EventInfo, eventId, userId } = req.body;
    if (!EventInfo || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "EventInfo, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "EventInfo",
      EventInfo,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createQuestionnaire = async (req, res) => {
  try {
    const { Questionnaire, eventId, userId } = req.body;
    if (!Questionnaire || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "Questionnaire, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "Questionnaire",
      Questionnaire,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent1 = async (req, res) => {
  try {
    const { StaticContent1, eventId, userId } = req.body;
    if (!StaticContent1 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent1, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent1",
      StaticContent1,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent2 = async (req, res) => {
  try {
    const { StaticContent2, eventId, userId } = req.body;
    if (!StaticContent2 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent2, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent2",
      StaticContent2,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent3 = async (req, res) => {
  try {
    const { StaticContent3, eventId, userId } = req.body;
    if (!StaticContent3 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent3, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent3",
      StaticContent3,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent4 = async (req, res) => {
  try {
    const { StaticContent4, eventId, userId } = req.body;
    if (!StaticContent4 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent4, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent4",
      StaticContent4,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent5 = async (req, res) => {
  try {
    const { StaticContent5, eventId, userId } = req.body;
    if (!StaticContent5 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent5, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent5",
      StaticContent5,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent6 = async (req, res) => {
  try {
    const { StaticContent6, eventId, userId } = req.body;
    if (!StaticContent6 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent6, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent6",
      StaticContent6,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaticContent7 = async (req, res) => {
  try {
    const { StaticContent7, eventId, userId } = req.body;
    if (!StaticContent7 || !eventId || !userId) {
      return res
        .status(400)
        .json({ error: "StaticContent7, eventId, and userId are required" });
    }
    const result = await createStaticContent(
      "StaticContent7",
      StaticContent7,
      eventId,
      userId,
      req.body
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.NonMenuStaticContent1 = async (req, res) => {
  try {
    const { NonMenuStaticContent1, eventId, userId } = req.body;
    const result = await createStaticContent(
      "NonMenuStaticContent1",
      NonMenuStaticContent1,
      eventId,
      userId,
      req.body
    );
    if (!NonMenuStaticContent1 || !eventId || !userId) {
      return res.status(400).json({
        error: "NonMenuStaticContent1, eventId, and userId are required",
      });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.NonMenuStaticContent2 = async (req, res) => {
  try {
    const { NonMenuStaticContent2, eventId, userId } = req.body;
    const result = await createStaticContent(
      "NonMenuStaticContent2",
      NonMenuStaticContent2,
      eventId,
      userId,
      req.body
    );
    if (!NonMenuStaticContent2 || !eventId || !userId) {
      return res.status(400).json({
        error: "NonMenuStaticContent2, eventId, and userId are required",
      });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.NonMenuStaticContent3 = async (req, res) => {
  try {
    const { NonMenuStaticContent3, eventId, userId } = req.body;
    const result = await createStaticContent(
      "NonMenuStaticContent3",
      NonMenuStaticContent3,
      eventId,
      userId,
      req.body
    );
    if (!NonMenuStaticContent3 || !eventId || !userId) {
      return res.status(400).json({
        error: "NonMenuStaticContent3, eventId, and userId are required",
      });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.NonMenuStaticContent4 = async (req, res) => {
  try {
    const { NonMenuStaticContent4, eventId, userId } = req.body;
    const result = await createStaticContent(
      "NonMenuStaticContent4",
      NonMenuStaticContent4,
      eventId,
      userId,
      req.body
    );
    if (!NonMenuStaticContent4 || !eventId || !userId) {
      return res.status(400).json({
        error: "NonMenuStaticContent4, eventId, and userId are required",
      });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.NonMenuStaticContent5 = async (req, res) => {
  try {
    const { NonMenuStaticContent5, eventId, userId } = req.body;
    const result = await createStaticContent(
      "NonMenuStaticContent5",
      NonMenuStaticContent5,
      eventId,
      userId,
      req.body
    );
    if (!NonMenuStaticContent4 || !eventId || !userId) {
      return res.status(400).json({
        error: "NonMenuStaticContent4, eventId, and userId are required",
      });
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
