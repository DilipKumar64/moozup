const prisma = require("../config/prisma");

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

module.exports = {
  findSessionById,
  updateSessionLiveStatus,
  findSessionQuestions
}; 