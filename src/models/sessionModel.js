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
      speakers: {
        select: {
          id: true,
          user: {
            select: {
              id : true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          }
        }
      },
    },
  });
};

//update session
// const updateSession = (id, data) => {
//   return prisma.session.update({
//     where: { id: parseInt(id) },
//     data,
//   });
// };


const updateSession = async (id, data, disconnectSpeakerIds = []) => {
  return await prisma.$transaction(async (prisma) => {
    // 1. Disconnect speakers if the list is not empty
    if (disconnectSpeakerIds.length > 0) {
      await prisma.session.update({
        where: { id: parseInt(id) },
        data: {
          speakers: {
            disconnect: disconnectSpeakerIds.map(speakerId => ({ id: Number(speakerId) }))
          }
        }
      });
    }

    // 2. Update the session with the incoming data
    return await prisma.session.update({
      where: { id: parseInt(id) },
      data,
    });
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
      speakers: {
        select: {
          id: true,
          user: {
            select: {
              id : true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              companyName: true,
              jobTitle: true
            }
          }
        }
      },
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

// Get sessions by eventId, optional date, with pagination
const getSessionsByEventAndDate = async (eventId, { date = null, page = 1, limit = 10 } = {}) => {
  const where = {
    eventId: Number(eventId),
    ...(date && { date: new Date(date) })
  };

  const [total, sessions] = await Promise.all([
    prisma.session.count({ where }),
    prisma.session.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'asc' },
      include: {
        sessionType: { select: { sessionname: true } },
        participationType: { select: { personParticipationType: true } },
        sponsorType: { select: { type: true } },
        speakers: {
          select: {
            id: true,
            user: {
              select: {
                id : true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            }
          }
        },
      },
    })
  ]);

  return {
    sessions,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1
  };
};

module.exports = {
  createSession,
  getAllSessions,
  updateSession,
  getSessionById,
  deleteSession,
  getUniqueSessionDates, 
  getSessionsByEventAndDate, // Export the new method
};
