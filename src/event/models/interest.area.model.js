const prisma = require("../../config/prisma");

const createInterestArea = (data) => prisma.interestArea.create({ 
  data
});

const findInterestAreaById = (id) => prisma.interestArea.findUnique({
  where: { id: parseInt(id) },
  include: {
    eventId: false,
    interestCategoryId: false,
    createdAt: false,
    createdBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    },
    interestCategory: {
      select: {
        id: true,
        title: true
      }
    }
  }
});

const updateInterestArea = (id, data) => prisma.interestArea.update({
  where: { id: parseInt(id) },
  data
});

const findInterestAreasByEventId = (eventId) => prisma.interestArea.findMany({
  where: { 
    eventId: parseInt(eventId)
  },
  include: {
    eventId: false,
    interestCategoryId: false,
    createdAt: false,
    createdBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    },
    interestCategory: {
      select: {
        id: true,
        title: true
      }
    }
  }
});

const deleteInterestArea = (id) => prisma.interestArea.delete({
  where: { id: parseInt(id) }
});

module.exports = {
  createInterestArea,
  findInterestAreaById,
  updateInterestArea,
  findInterestAreasByEventId,
  deleteInterestArea
}; 