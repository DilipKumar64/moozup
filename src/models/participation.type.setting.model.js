const prisma = require("../config/prisma");

const createParticipationTypeSetting = (data) =>
  prisma.participationTypeSetting.create({
    data: {
      ...data,
      canViewProfile: data.canViewProfile ?? true,
      canScheduleMeeting: data.canScheduleMeeting ?? true,
      canSendMessage: data.canSendMessage ?? true,
    },
    include: {
      sourceType: true,
      targetType: true,
    },
  });

const findParticipationTypeSettingById = (id) =>
  prisma.participationTypeSetting.findUnique({
    where: { id: parseInt(id) },
    include: {
      sourceType: true,
      targetType: true,
    },
  });

const findParticipationTypeSettingsByEventId = (eventId) =>
  prisma.participationTypeSetting.findMany({
    where: { eventId: parseInt(eventId) },
    include: {
      sourceType: true,
      targetType: true,
    },
  });

const findParticipationTypeSettingByTypes = (
  eventId,
  sourceTypeId,
  targetTypeId
) =>
  prisma.participationTypeSetting.findUnique({
    where: {
      eventId_sourceTypeId_targetTypeId: {
        eventId: parseInt(eventId),
        sourceTypeId: parseInt(sourceTypeId),
        targetTypeId: parseInt(targetTypeId),
      },
    },
    include: {
      sourceType: true,
      targetType: true,
    },
  });

const updateParticipationTypeSetting = (id, data) =>
  prisma.participationTypeSetting.update({
    where: { id: parseInt(id) },
    data,
    include: {
      sourceType: true,
      targetType: true,
    },
  });

const deleteParticipationTypeSetting = (id) =>
  prisma.participationTypeSetting.delete({
    where: { id: parseInt(id) },
  });

const deleteSettingsByParticipationTypeId = (participationTypeId) =>
  prisma.participationTypeSetting.deleteMany({
    where: {
      OR: [
        { sourceTypeId: parseInt(participationTypeId) },
        { targetTypeId: parseInt(participationTypeId) },
      ],
    },
  });

const deleteParticipationTypeSettingsByEventId = (eventId) =>
  prisma.participationTypeSetting.deleteMany({
    where: { eventId: parseInt(eventId) },
  });

module.exports = {
  createParticipationTypeSetting,
  findParticipationTypeSettingById,
  findParticipationTypeSettingsByEventId,
  findParticipationTypeSettingByTypes,
  updateParticipationTypeSetting,
  deleteParticipationTypeSetting,
  deleteSettingsByParticipationTypeId,
  deleteParticipationTypeSettingsByEventId,
};
