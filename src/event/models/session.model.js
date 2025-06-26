const prisma = require("../../config/prisma");

const findSessionById = (id) => prisma.session.findUnique({
  where: { id: parseInt(id) },
  include: {
    event: true
  }
});

const updateSessionLiveStatus = (id, isLive) => prisma.session.update({
  where: { id: parseInt(id) },
  data: {
    isLive,
    wentLiveAt: isLive ? new Date() : null
  },
  include: {
    event: true
  }
});

const findSessionQuestions = (sessionId, status) => prisma.question.findMany({
  where: {
    sessionId: parseInt(sessionId),
    ...(status && { status })
  },
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});

const findSessionsByDate = async (date, eventId) => {
  let whereClause = {
    eventId: parseInt(eventId)
  };

  if (date) {
    // Parse the input date and create UTC dates
    const [year, month, day] = date.split('-').map(Number);
    
    // Create start date in UTC
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    // Create end date in UTC
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    whereClause.date = {
      gte: startDate,
      lte: endDate
    };
  }

  // Now perform the actual query
  const sessions = await prisma.session.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      isLive: true,
      wentLiveAt: true
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  return sessions;
};

module.exports = {
  findSessionById,
  updateSessionLiveStatus,
  findSessionQuestions,
  findSessionsByDate
}; 