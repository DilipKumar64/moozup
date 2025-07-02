const prisma = require("../config/prisma");

const createSession = (data) => {
  console.log("Session Data:", data); // Log the data to check the values
  return prisma.session.create({
    data,
  });
};

//get all sessions
const getAllSessions = (eventId, limit = null) => {
  return prisma.session.findMany({
    where:{
      eventId: eventId
    },
    ...(limit && { take: limit }),
    include: {
      // event: true,
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
          user:{
            select: {
              profilePicture: true
            }
          }
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

// Add this method to get unique session dates for an event, sorted ascending
const getUniqueSessionDates = async (eventId) => {
  const dates = await prisma.session.findMany({
    where: { eventId: Number(eventId) },
    select: { date: true },
    orderBy: { date: 'asc' },
    distinct: ['date'],
  });
  // Map to just the date values
  return dates.map(d => d.date);
};

module.exports = {
  createSession,
  getAllSessions,
  updateSession,
  getSessionById,
  deleteSession,
  getUniqueSessionDates, 
};
