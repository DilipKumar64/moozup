const prisma = require("../../config/prisma");

const createInterestCategory = (data) => prisma.interestCategory.create({ 
  data
});

const findInterestCategoryById = (id) => prisma.interestCategory.findUnique({
  where: { id: parseInt(id) },
});

const updateInterestCategory = (id, data) => prisma.interestCategory.update({
  where: { id: parseInt(id) },
  data
});

const findInterestCategoriesByEventId = (eventId) => prisma.interestCategory.findMany({
  where: { 
    eventId: parseInt(eventId)
  },
  include: {
    createdBy: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    }
  }
});

const deleteInterestCategory = (id) => prisma.interestCategory.delete({
  where: { id: parseInt(id) }
});

module.exports = {
  createInterestCategory,
  updateInterestCategory,
  findInterestCategoryById,
  findInterestCategoriesByEventId,
  deleteInterestCategory
}; 