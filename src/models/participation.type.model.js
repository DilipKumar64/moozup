const prisma = require("../config/prisma");

const createParticipationType = (data) => prisma.participationType.create({ data });

const findParticipationTypeById = (id) => prisma.participationType.findUnique({
  where: { id: parseInt(id) }
});

const findParticipationTypesByEventId = (eventId) => prisma.participationType.findMany({
  where: { eventId: parseInt(eventId) }
});

const updateParticipationType = (id, data) => prisma.participationType.update({
  where: { id: parseInt(id) },
  data
});

const deleteParticipationType = (id) => prisma.participationType.delete({
  where: { id: parseInt(id) }
});

const updateVisibility = async (id, isVisibleInApp) => {
  return await prisma.participationType.update({
    where: { id: parseInt(id) },
    data: { isVisibleInApp }
  });
};

const updateEventAllowance = async (id, isAllowedInEvent) => {
  return await prisma.participationType.update({
    where: { id: parseInt(id) },
    data: { isAllowedInEvent }
  });
};

module.exports = {
  createParticipationType,
  findParticipationTypeById,
  findParticipationTypesByEventId,
  updateParticipationType,
  deleteParticipationType,
  updateVisibility,
  updateEventAllowance
}; 