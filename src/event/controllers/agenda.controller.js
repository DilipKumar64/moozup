//  Create Session Type
const prisma = require("../../config/prisma");
const { createAwardedPerson, getAllAwardedPersons, getAwardedPersonById, updateAwardedPerson, deleteAwardedPersonById } = require("../models/awardPeople.model");
const {
  createAwardType,
  getAllAwardTypes,
  getAwardTypeById,
  updateAwardType,
  deleteAwardTypeById,
} = require("../models/awardType.model");
const {
  createSession,
  getAllSessions,
  updateSession,
  getSessionById,
  deleteSession,
} = require("../models/sessionModel");
const {
  findSessionTypeByName,
  createSessionType,
  getAllSessionTypes,
  getSessionTypeById,
  updateSessionType,
  deleteSessionTypeById,
} = require("../models/sessionTypeModel");

// 📄 Create Session Type
// create session
const { validationResult } = require("express-validator"); // if you're using validation

// Controller function to create a session type
exports.createSessionType = async (req, res) => {
  try {
    const { sessionname, color, eventId } = req.body;

    if (!sessionname || !color || !eventId) {
      return res
        .status(400)
        .json({ message: "sessionname, color, and eventId are required." });
    }

    const existing = await findSessionTypeByName(sessionname);
    if (existing) {
      return res.status(409).json({ message: "Session type already exists." });
    }

    const sessionType = await createSessionType(sessionname, color, eventId);
    res.status(201).json(sessionType);
  } catch (error) {
    console.error("Error creating session type:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// 📄 Get All Session Types
exports.GetAllSessionTypes = async (req, res) => {
  try {
    const types = await getAllSessionTypes();
    res.status(200).json(types);
  } catch (error) {
    console.error("Get All Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📄 Get Session Type By ID
exports.GetSessionTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const type = await getSessionTypeById(id);

    if (!type) {
      return res.status(404).json({ message: "Session type not found" });
    }

    res.status(200).json(type);
  } catch (error) {
    console.error("Get By ID Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📄 Update Session Type
exports.UpdateSessionType = async (req, res) => {
  try {
    const id = req.params.id;
    const { sessionname, color } = req.body;

    const updated = await updateSessionType(id, sessionname, color);
    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 📄 Delete Session Type
exports.DeleteSessionTypeById = async (req, res) => {
  try {
    const id = req.params.id;

    await deleteSessionTypeById(id);
    res.status(200).json({ message: "Session type deleted successfully." });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function to create a session

exports.createSession = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      hall,
      track,
      keywords,
      sessionTypeId,
      eventId,
      sponsorTypeId,
      sponsorName, // sponsorId
      speakerId,
      participationTypeId,
      isSpeakathon = false,
      enableFeedback = false,
      isLive = false,
      wentLiveAt = null,
    } = req.body;

    // 🔍 Step 1: Validate sponsorName with sponsorTypeId
    const sponsor = await prisma.sponsor.findFirst({
      where: {
        id: Number(sponsorName),  // Ensure sponsorName is a number
        sponsorTypeId: Number(sponsorTypeId),  // Ensure sponsorTypeId is a number
      },
    });

    if (!sponsor) {
      return res.status(400).json({
        message: `Invalid sponsorName: No sponsor with ID ${sponsorName} found under sponsorTypeId ${sponsorTypeId}`,
      });
    }

    // 🔍 Step 2: Validate speakerId with participationTypeId
    const speaker = await prisma.user.findFirst({
      where: {
        id: Number(speakerId),  // Ensure speakerId is a number
        participationTypeId: Number(participationTypeId),  // Ensure participationTypeId is a number
      },
    });

    if (!speaker) {
      return res.status(400).json({
        message: `Invalid speakerId: No speaker with ID ${speakerId} found under participationTypeId ${participationTypeId}`,
      });
    }

    // ✅ Step 3: Create Session if both valid
    const session = await prisma.session.create({
      data: {
        title,
        description,
        date: new Date(date),  // Ensure date is correctly parsed
        startTime,
        endTime,
        venue,
        hall,
        track,
        keywords,
        isSpeakathon,
        enableFeedback,
        isLive,
        wentLiveAt: wentLiveAt ? new Date(wentLiveAt) : null,  
        sessionTypeId: Number(sessionTypeId),  
        eventId: Number(eventId),  
        sponsorTypeId: Number(sponsorTypeId),  
        sponsorName: Number(sponsorName), 
        speakerId: Number(speakerId),  
        participationTypeId: Number(participationTypeId),  
      },
    });

    res.status(201).json({
      message: 'Session created successfully',
      session,
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      message: 'Failed to create session',
      error,
    });
  }
};



// get all sessions
exports.getAllSessions = async (req, res) => {
  try {
    // Validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const sessions = await getAllSessions();

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sessions found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data: sessions,
    });
  } catch (error) {
    console.error("Error retrieving sessions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sessions",
      error: error.message,
    });
  }
};

// update session

exports.updateSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      hall,
      track,
      isSpeakathon,
      enableFeedback,
      keywords,
      eventId,
      sessionTypeId,
      participationTypeId,
      sponsorTypeId,
      sponsorName,
      speakerId,
    } = req.body;

    const updatedSession = await updateSession(id, {
      title,
      description,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      venue,
      hall,
      track,
      isSpeakathon,
      enableFeedback,
      keywords,
      eventId: parseInt(eventId),
      sessionTypeId: parseInt(sessionTypeId),
      participationTypeId: participationTypeId
        ? parseInt(participationTypeId)
        : null,
      sponsorTypeId: sponsorTypeId ? parseInt(sponsorTypeId) : null,
      sponsorName,
      speakerId: speakerId ? parseInt(speakerId) : null,
    });

    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: updatedSession,
    });
  } catch (error) {
    console.error("Error updating session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update session",
      error: error.message,
    });
  }
};

// getSingle session
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await getSessionById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session retrieved successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error retrieving session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve session",
      error: error.message,
    });
  }
};

// delete session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSession = await deleteSession(id);

    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete session",
      error: error.message,
    });
  }
};

// Controller function to create a session Award Type

// Create award type
exports.createAwardType = async (req, res) => {
  try {
    const { awardType, priority, eventId } = req.body;

    if (!awardType || !priority || !eventId) {
      return res.status(400).json({
        success: false,
        message: "awardName,priority,eventId is required",
      });
    }

    const newAward = await createAwardType({
      awardType,
      priority: parseInt(priority), // Convert string to integer
      eventId: parseInt(eventId), // Optional: Convert eventId also if it's a string
    });
    res.status(201).json({ success: true, data: newAward });
  } catch (error) {
    console.error("Error creating award type:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to create award type" });
  }
};

// Get all award types
exports.getAllAwardTypes = async (req, res) => {
  try {
    const awardTypes = await getAllAwardTypes();
    res.status(200).json({ success: true, data: awardTypes });
  } catch (error) {
    console.error("Error retrieving award types:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve award types" });
  }
};

// Get award type by ID
exports.getAwardTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const awardType = await getAwardTypeById(id);

    if (!awardType) {
      return res.status(404).json({
        success: false,
        message: "Award type not found",
      });
    }

    res.status(200).json({ success: true, data: awardType });
  } catch (error) {
    console.error("Error retrieving award type:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve award type" });
  }
};

// Update award type by ID
exports.updateAwardType = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { awardType, priority } = req.body;

    const updatedAwardType = await updateAwardType(id, {
      awardType,
      priority: parseInt(priority),
    });

    if (!updatedAwardType) {
      return res.status(404).json({
        success: false,
        message: "Award type not found",
      });
    }

    res.status(200).json({ success: true, data: updatedAwardType });
  } catch (error) {
    console.error("Error updating award type:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update award type" });
  }
};

// Delete award type by ID (optional, if you want to implement this)
exports.deleteAwardTypeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteAwardTypeById(id);
    res.status(200).json({ success: true, message: "Award type deleted" });
  } catch (error) {
    console.error("Error deleting award type:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete award type" });
  }
};






// awrded person controller

// Create Awarded Person
exports.createAwardedPerson = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { eventId, sessionId, awardId, personName } = req.body;

    if (!eventId || !sessionId || !awardId || !personName) {
      return res.status(400).json({
        success: false,
        message: "eventId, sessionId, awardId, personName are required",
      });
    }

    const newAwardedPerson = await createAwardedPerson({
      eventId: parseInt(eventId),
      sessionId: parseInt(sessionId),
      awardId: parseInt(awardId),
      personName

    });

    res.status(201).json({
      success: true,
      data: newAwardedPerson,
    });
  } catch (error) {
    console.error("Error creating awarded person:", error.message);
    res.status(500).json({ success: false, message: "Failed to create awarded person" });
  }
};

// Get all Awarded Persons and include eventDate from the Event model
exports.getAllAwardedPersons = async (req, res) => {
  try {
    const awardedPersons = await getAllAwardedPersons();
    res.status(200).json({
      success: true,
      data: awardedPersons,
    });
  } catch (error) {
    console.error("Error retrieving awarded persons:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve awarded persons" });
  }
};


// Get Awarded Person by ID
exports.getAwardedPersonById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const awardedPerson = await getAwardedPersonById(id);

    if (!awardedPerson) {
      return res.status(404).json({
        success: false,
        message: "Awarded person not found",
      });
    }

    res.status(200).json({ success: true, data: awardedPerson });
  } catch (error) {
    console.error("Error retrieving awarded person:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve awarded person" });
  }
};

// Update Awarded Person by ID (optional, if you want to implement this)
exports.updateAwardedPerson = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { eventId, sessionId, awardId, personName } = req.body;

    const updatedAwardedPerson = await updateAwardedPerson(id, {
      eventId: parseInt(eventId),
      sessionId: parseInt(sessionId),
      awardId: parseInt(awardId),
      personName,
    });

    if (!updatedAwardedPerson) {
      return res.status(404).json({
        success: false,
        message: "Awarded person not found",
      });
    }

    res.status(200).json({ success: true, data: updatedAwardedPerson });
  } catch (error) {
    console.error("Error updating awarded person:", error.message);
    res.status(500).json({ success: false, message: "Failed to update awarded person" });
  }
};


// Delete Awarded Person by ID (optional, if you want to implement this)
exports.deleteAwardedPersonById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteAwardedPersonById(id);
    res.status(200).json({ success: true, message: "Awarded person deleted" });
  } catch (error) {
    console.error("Error deleting awarded person:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete awarded person" });
  }
};