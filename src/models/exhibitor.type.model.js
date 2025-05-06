const prisma = require("../config/prisma");

const createExhibitorType = (data) => prisma.exhibitorType.create({ data });

const findExhibitorTypeById = (id) => prisma.exhibitorType.findUnique({
  where: { id: parseInt(id) }
});

const findExhibitorTypesByEventId = (eventId) => prisma.exhibitorType.findMany({
  where: { eventId: parseInt(eventId) }
});

const updateExhibitorType = (id, data) => prisma.exhibitorType.update({
  where: { id: parseInt(id) },
  data
});

const deleteExhibitorType = (id) => prisma.exhibitorType.delete({
  where: { id: parseInt(id) }
});

module.exports = {
  createExhibitorType,
  findExhibitorTypeById,
  findExhibitorTypesByEventId,
  updateExhibitorType,
  deleteExhibitorType
}; 