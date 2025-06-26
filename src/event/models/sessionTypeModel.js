const prisma = require("../../config/prisma");
// Create a new session type
const createSessionType = async (sessionname, color, eventId) => {
  // Parse the eventId to ensure it's an integer
  const parsedEventId = parseInt(eventId);

  // Check if the parsedEventId is a valid number
  if (isNaN(parsedEventId)) {
    throw new Error("Invalid eventId: it should be a valid number.");
  }

  return await prisma.sessionType.create({
    data: {
      sessionname,
      color,
      eventId: parsedEventId, // Use the parsed eventId
      isActive: true, // Default value for isActive
      // Prisma will automatically manage createdAt and updatedAt
    },
  });
};

// Find a session type by its name (case-insensitive)
const findSessionTypeByName = async (sessionname) => {
  return await prisma.sessionType.findFirst({
    where: {
      sessionname: {
        equals: sessionname,
        mode: "insensitive", // Case-insensitive search
      },
    },
  });
};

// Get all session types
const getAllSessionTypes = async () => {
  return await prisma.sessionType.findMany();
};

// Get a session type by its ID
const getSessionTypeById = async (id) => {
  return await prisma.sessionType.findUnique({
    where: { id: parseInt(id) },
  });
};

// Update a session type by its ID
const updateSessionType = async (id, sessionname, color) => {
  return await prisma.sessionType.update({
    where: { id: parseInt(id) },
    data: {
      sessionname,
      color,
    },
  });
};

const deleteSessionTypeById = async (id) => {
  return await prisma.sessionType.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createSessionType,
  findSessionTypeByName,
  getAllSessionTypes,
  getSessionTypeById,
  updateSessionType,
  deleteSessionTypeById,
  // Add other functions as needed
};
