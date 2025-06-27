const prisma = require("../config/prisma");

/**
 * Create a new exhibitor
 * @param {Object} exhibitorData - The exhibitor data
 * @returns {Promise<Object>} The created exhibitor
 */
const createExhibitor = (data) => prisma.exhibitor.create({ 
  data,
  include: {
    exhibitorType: true,
    exhibitorPersons: true,
    documents: true
  }
});

const findExhibitorById = (id) => prisma.exhibitor.findUnique({ 
  where: { id: parseInt(id) },
  include: {
    exhibitorType: true,
    exhibitorPersons: true,
    documents: true
  }
});

const findExhibitorsByEventId = (eventId) => prisma.exhibitor.findMany({
  where: {
    exhibitorType: {
      eventId: parseInt(eventId)
    }
  },
  include: {
    exhibitorType: true,
    exhibitorPersons: true,
    documents: true
  }
});

const updateExhibitor = (id, data) => prisma.exhibitor.update({
  where: { id: parseInt(id) },
  data,
  include: {
    exhibitorType: true,
    exhibitorPersons: true,
    documents: true
  }
});

const addExhibitorPersons = async (exhibitorId, userIds) => {
  try {
    // First get the current exhibitor to get existing person IDs
    const currentExhibitor = await prisma.exhibitor.findUnique({
      where: { id: parseInt(exhibitorId) },
      include: {
        exhibitorPersons: {
          select: { id: true }
        }
      }
    });

    // Disconnect all existing persons
    const updatedExhibitor = await prisma.exhibitor.update({
      where: { id: parseInt(exhibitorId) },
      data: {
        exhibitorPersons: {
          disconnect: currentExhibitor.exhibitorPersons.map(person => ({ id: person.id }))
        }
      }
    });

    // Connect new persons
    const finalExhibitor = await prisma.exhibitor.update({
      where: { id: parseInt(exhibitorId) },
      data: {
        exhibitorPersons: {
          connect: userIds.map(id => ({ id: parseInt(id) }))
        }
      },
      include: {
        exhibitorPersons: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    return finalExhibitor;
  } catch (error) {
    console.error("Error updating exhibitor persons:", error);
    throw error;
  }
};

const addExhibitorDocument = async (exhibitorId, documentData) => {
  return prisma.exhibitorDocument.create({
    data: {
      name: documentData.name,
      url: documentData.url,
      exhibitorId: parseInt(exhibitorId)
    }
  });
};

const deleteExhibitor = async (id) => {
  // First delete all associated documents
  await prisma.exhibitorDocument.deleteMany({
    where: { exhibitorId: parseInt(id) }
  });

  // Then delete the exhibitor
  return prisma.exhibitor.delete({
    where: { id: parseInt(id) }
  });
};

const bulkUpdateExhibitorDisplayOrder = async (updates) => {
  // First, get all exhibitor IDs to validate existence
  const exhibitorIds = updates.map(update => parseInt(update.id));
  const existingExhibitors = await prisma.exhibitor.findMany({
    where: {
      id: {
        in: exhibitorIds
      }
    },
    select: {
      id: true
    }
  });

  // Check if all exhibitors exist
  const existingIds = existingExhibitors.map(exhibitor => exhibitor.id);
  const missingIds = exhibitorIds.filter(id => !existingIds.includes(id));

  if (missingIds.length > 0) {
    throw new Error(`Exhibitors not found with IDs: ${missingIds.join(', ')}`);
  }

  // Use a transaction to ensure all updates succeed or none do
  return prisma.$transaction(
    updates.map(update => 
      prisma.exhibitor.update({
        where: { id: parseInt(update.id) },
        data: { displayOrder: parseInt(update.displayOrder) }
      })
    )
  );
};

const updateExhibitorDisplayOrder = async (id, displayOrder) => {
  return prisma.exhibitor.update({
    where: { id: parseInt(id) },
    data: { displayOrder: parseInt(displayOrder) },
    include: {
      exhibitorType: true,
      exhibitorPersons: true,
      documents: true
    }
  });
};

const getAllExhibitors = async (page = 1, limit = 10, exhibitorTypeId = null, eventId = null) => {
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where = {
    ...(exhibitorTypeId ? { exhibitorTypeId: parseInt(exhibitorTypeId) } : {}),
    ...(eventId ? {
      exhibitorType: {
        eventId: parseInt(eventId)
      }
    } : {})
  };

  // Get total count
  const total = await prisma.exhibitor.count({ where });

  // Get exhibitors with pagination
  const exhibitors = await prisma.exhibitor.findMany({
    where,
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      website: true,
      logo: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    total,
    exhibitors,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasNextPage: skip + limit < total,
    hasPreviousPage: page > 1
  };
};

// Get exhibitors by event with limit
const getExhibitorsByEvent = async (eventId, limit = null) => {
  return prisma.exhibitor.findMany({
    where: {
      exhibitorType: {
        eventId: parseInt(eventId)
      }
    },
    ...(limit && { take: limit }),
    select: {
      id: true,
      name: true,
      website: true,
      logo: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

module.exports = {
  createExhibitor,
  findExhibitorById,
  findExhibitorsByEventId,
  updateExhibitor,
  addExhibitorPersons,
  addExhibitorDocument,
  deleteExhibitor,
  bulkUpdateExhibitorDisplayOrder,
  updateExhibitorDisplayOrder,
  getAllExhibitors,
  getExhibitorsByEvent
}; 