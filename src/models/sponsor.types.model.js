const prisma = require("../config/prisma");

const createSponsorType = (data) => prisma.sponsorType.create({ data });

const findSponsorTypeById = (id) => prisma.sponsorType.findUnique({
  where: { id: parseInt(id) }
});

const findSponsorTypesByEventId = (eventId) => prisma.sponsorType.findMany({
  where: { eventId: parseInt(eventId) }
});

const updateSponsorType = (id, data) => prisma.sponsorType.update({
  where: { id: parseInt(id) },
  data
});

const deleteSponsorType = (id) => prisma.sponsorType.delete({
  where: { id: parseInt(id) }
});

module.exports = {
  createSponsorType,
  findSponsorTypeById,
  findSponsorTypesByEventId,
  updateSponsorType,
  deleteSponsorType
}; 