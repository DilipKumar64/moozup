const prisma = require("../config/prisma"); // Make sure this path is correct

// Create Event
const createEvent = async (data) => {
  try {
    const event = await prisma.event.create({
      data,
    });
    return event;
  } catch (error) {
    throw new Error("Error creating event: " + error.message);
  }
};

// Find all events
const findAllEvents = () => prisma.event.findMany();

// Find event by ID
const findEventById = (id) => {
  return prisma.event.findUnique({
    where: { id: Number(id) },
  });
};

// Update event by ID
const updateEventById = (id, data) => {
  return prisma.event.update({
    where: { id: Number(id) },
    data: data,
  });
};

// Delete event by ID
const deleteEventById = (id) => {
  return prisma.event.delete({
    where: { id: Number(id) },
  });
};

// Join Event
const joinEvent = async (userId, eventId) => {
  try {
    // Parse eventId as integer
    const parsedEventId = parseInt(eventId);

    // Check if user is already attending the event
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: parseInt(userId), // Ensure userId is an integer
          eventId: parsedEventId, // Use parsed eventId
        },
      },
    });

    if (existingAttendee) {
      throw new Error("User is already attending this event.");
    }

    // Create the attendee if not already attending
    const attendee = await prisma.eventAttendee.create({
      data: {
        userId: parseInt(userId),
        eventId: parsedEventId,
      },
    });
    return attendee; // Returning the attendee info
  } catch (error) {
    throw new Error("Error while joining the event: " + error.message);
  }
};

const leaveEvent = async (userId, eventId) => {
  try {
    // Parse eventId as integer
    const parsedEventId = parseInt(eventId);

    // Check if the user is actually attending the event
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: parseInt(userId), // Ensure userId is an integer
          eventId: parsedEventId, // Use parsed eventId
        },
      },
    });

    if (!existingAttendee) {
      throw new Error("User is not attending this event.");
    }

    // Delete the attendee record if the user is attending the event
    const deletedAttendee = await prisma.eventAttendee.delete({
      where: {
        userId_eventId: {
          userId: parseInt(userId),
          eventId: parsedEventId,
        },
      },
    });

    return deletedAttendee; // Returning the deleted attendee info
  } catch (error) {
    throw new Error("Error while leaving the event: " + error.message);
  }
};

// Get all events created by the user
const getEventsByCreatorId = (creatorId) => {
  return prisma.event.findMany({
    where: {
      creatorId: creatorId, // Filter by creatorId
    },
    include: {
      creator: true, // Optionally include creator details (if needed)
    },
  });
};

const reportEvent = async (eventId, userId, reason) => {
  return await prisma.eventReport.create({
    data: {
      eventId,
      userId,
      reason,
    },
  });
};

const rsvpToEvent = async (eventId, userId) => {
  // Check if event exists
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new Error("Event not found");
  }

  // Check for duplicate RSVP
  const existingRSVP = await prisma.eventRSVP.findFirst({
    where: { eventId, userId },
  });

  if (existingRSVP) {
    throw new Error("You have already RSVPed to this event.");
  }

  // Create RSVP
  const rsvp = await prisma.eventRSVP.create({
    data: {
      eventId,
      userId,
    },
  });

  return rsvp;
};

const getAttendees = async (eventId) => {
  // Fetch all RSVPs for the event and join the User model to get user details
  const attendees = await prisma.eventRSVP.findMany({
    where: { eventId: eventId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  return attendees;
};


module.exports = {
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
};
