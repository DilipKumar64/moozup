const prisma = require("../../config/prisma");

const createSession = (data) => {
  console.log("Session Data:", data); // Log the data to check the values
  return prisma.session.create({
    data,
  });
};

//get all sessions
const getAllSessions = () => {
  return prisma.session.findMany({
    include: {
      event: true,
      sessionType: {
        select: {
          sessionname: true,
        },
      },
      participationType: {
        select: {
          personParticipationType: true,
        },
      },
      sponsorType: {
        select: {
          type: true,
        },
      },
      speaker: {
        select: {
          firstName: true,
        },
      },
    },
  });
};

//update session

const updateSession = (id, data) => {
  return prisma.session.update({
    where: { id: parseInt(id) },
    data,
  });
};

// single session
const getSessionById = (id) => {
  return prisma.session.findUnique({
    where: { id: parseInt(id) },
    include: {
      event: true,
      sessionType: true,
      participationType: true,
      sponsorType: true,
      speaker: true,
    },
  });
};

// delete session
const deleteSession = (id) => {
  return prisma.session.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createSession,
  getAllSessions,
  updateSession,
  getSessionById,
  deleteSession,
  // Add other session-related functions here as needed
};
