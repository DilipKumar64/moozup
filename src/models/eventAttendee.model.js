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

const findEventAttandeeForComment = (id) => {
  return prisma.eventAttendee.findFirst({
    where: {
      id: id
    },
    select: {
      id: true,
      user: {
        select: {
          profilePicture: true,
          firstName: true
        }
      }
    }
  })
}

const findAttendeesByParticipationType = async (
  eventId,
  participationTypeId,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;
  const where = {
    eventId: parseInt(eventId),
    participationTypeId: parseInt(participationTypeId),
  };

  const [data, total] = await prisma.$transaction([
    prisma.eventAttendee.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            profilePicture: true,
            companyName: true,
            jobTitle: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    }),
    prisma.eventAttendee.count({ where }),
  ]);

  return {
    data,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasNextPage: skip + limit < total,
    hasPreviousPage: page > 1,
  };
};
const checkEventAttendeeExists =(id)=>{
  return prisma.eventAttendee.findUnique({
    where: {id:parseInt(id)},
    select:{
      user: {
        select: {
          id: true
        }
      }
    }
  })
}

const updateEventAttendeeAndUser =async (userId,attendeeId,userData,attendeeData)=>{
  const [user,attendee]= await prisma.$transaction([
  prisma.user.update({
      where: {
        id: Number(userId)
      },
      data: userData,
    }),
    prisma.eventAttendee.update({
      where:{
        id: Number(attendeeId),
      },
      data: attendeeData
    })
  ]);

  return {
    user,
    attendee
  }
}

const updateEventAttendee = async (id, data)=> prisma.eventAttendee.update({
    where: {
      id: Number(id)
    },
    data
  })

const getEventAttendeeById = async (id)=>{
  return prisma.eventAttendee.findUnique({
    where: {
      id: Number(id)
    },
    select: {
      id: true,
      description: true,
      user: {
        select: {
          firstName : true,
          lastName: true,
          profilePicture: true,
          jobTitle: true,
          companyName: true,
          linkedinUrl: true,
          facebookUrl: true,
          twitterUrl: true,
          email: true,

        }
      },
      sessions:{
        select: {
          id: true,
          title :true,
          startTime: true,
          endTime: true,
          description: true,
          hall : true,
          isLive: true
        }
      }
    }
  });
}

// Check which EventAttendee IDs do not exist in the database
const findMissingEventAttendeeIds = async (ids) => {
  // Fetch all existing EventAttendee records with the given IDs
  const existing = await prisma.eventAttendee.findMany({
    where: {
      id: { in: ids }
    },
    select: { id: true }
  });

  // Extract the found IDs
  const foundIds = new Set(existing.map(e => e.id));

  // Find which IDs were not found
  const missingIds = ids.filter(id => !foundIds.has(id));

  return missingIds;
};

// Find an EventAttendee record by userId and eventId
const findEventAttendeeDetail = (userId, eventId) => {
  return prisma.eventAttendee.findUnique({
    where: {
      userId_eventId: {
        userId: parseInt(userId),
        eventId: parseInt(eventId),
      },
    },
    select: {
      id: true,
      participationTypeId : true,
      user: true
    }
  });
};

module.exports = {
  createEventAttendee,
  findEventAttendee,
  findEventsByUserId,
  findUsersByEventId,
  findUsersByParticipationType,
  deleteEventAttendee,
  findEventAttandeeByParticipationTypeId,
  findEventAttandeeForComment,
  findAttendeesByParticipationType,
  checkEventAttendeeExists,
  updateEventAttendeeAndUser,
  updateEventAttendee,
  getEventAttendeeById,
  findMissingEventAttendeeIds,
  findEventAttendeeDetail
}; 