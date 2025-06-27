const prisma = require("../config/prisma");

// Create a new EventAttendee record
const createEventAttendee = (data) => {
  return prisma.eventAttendee.create({ data });
};

// Find an EventAttendee record by userId and eventId
const findEventAttendee = (userId, eventId) => {
  return prisma.eventAttendee.findUnique({
    where: {
      userId_eventId: {
        userId: parseInt(userId),
        eventId: parseInt(eventId),
      },
    },
  });
};

// Find all events for a given user
const findEventsByUserId = (userId) => {
  return prisma.eventAttendee.findMany({
    where: { userId: parseInt(userId) },
    include: {
      event: true,
      participationType: true,
    },
  });
};

// Find all users for a given event
const findUsersByEventId = (eventId, limit = null) => {
  return prisma.eventAttendee.findMany({
    where: { eventId: parseInt(eventId) },
    ...(limit && { take: limit }),
    include: {
      user: true,
      participationType: true,
    },
  });
};

// Find users by participation type with limit
const findUsersByParticipationType = (eventId, participationTypeId, limit = null) => {
  return prisma.eventAttendee.findMany({
    where: { 
      eventId: parseInt(eventId),
      participationTypeId: parseInt(participationTypeId)
    },
    ...(limit && { take: limit }),
    include: {
      user: true,
      participationType: true,
    },
  });
};

// Delete an EventAttendee record
const deleteEventAttendee = (userId, eventId) => {
  return prisma.eventAttendee.delete({
    where: {
      userId_eventId: {
        userId: parseInt(userId),
        eventId: parseInt(eventId),
      },
    },
  });
};

// find event attandee for sponsor
const findEventAttandeeByParticipationTypeId = (eventAttandeeId, participationTypeId) => {
  return prisma.eventAttendee.findFirst({
    where:{
      id: eventAttandeeId,
      participationTypeId: participationTypeId
    }
  })
}

module.exports = {
  createEventAttendee,
  findEventAttendee,
  findEventsByUserId,
  findUsersByEventId,
  findUsersByParticipationType,
  deleteEventAttendee,
  findEventAttandeeByParticipationTypeId 
}; 