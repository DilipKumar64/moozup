const {
  createEvent,
  findAllEvents,
  findEventById,
  updateEventById,
  deleteEventById,
} = require("../models/eventModel"); // Import model function

// Create Event
exports.createEvent = async (req, res) => {
  const { title, description, location, date, creatorId } = req.body;

  // Input validation
  if (!title || !description || !location || !date || !creatorId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Convert creatorId to an integer
  const parsedCreatorId = Number(creatorId); // Using Number() to convert to integer

  // Check if creatorId is valid
  if (isNaN(parsedCreatorId)) {
    return res.status(400).json({ message: "Invalid creatorId" });
  }

  try {
    // Call the model to create the event
    const newEvent = await createEvent({
      title,
      description,
      location,
      date: new Date(date), // Ensure the date is in proper format
      creatorId: parsedCreatorId, // Use the parsed creatorId
    });

    // Return the response with created event
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
