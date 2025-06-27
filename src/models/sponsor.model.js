const prisma = require("../config/prisma");

const createSponsor = (data) => prisma.sponsor.create({ data });

const findSponsorById = (id) => prisma.sponsor.findUnique({ 
  where: { id: parseInt(id) },
  include: {
    sponsorType: true,
    sponsorPersons: true,
    documents: true
  }
});

const findSponsorsByEventId = (eventId) => prisma.sponsor.findMany({
  where: {
    sponsorType: {
      eventId: parseInt(eventId)
    }
  },
  include: {
    sponsorType: true,
    sponsorPersons: true,
    documents: true
  }
});

const updateSponsor = (id, data) => prisma.sponsor.update({
  where: { id: parseInt(id) },
  data,
  include: {
    sponsorType: true,
    sponsorPersons: true,
    documents: true
  }
});

const addSponsorPersons = async (sponsorId, userIds) => {
  try {
    // First get the current sponsor to get existing person IDs
    const currentSponsor = await prisma.sponsor.findUnique({
      where: { id: parseInt(sponsorId) },
      include: {
        sponsorPersons: {
          select: { id: true }
        }
      }
    });

    // Disconnect all existing persons
    const updatedSponsor = await prisma.sponsor.update({
      where: { id: parseInt(sponsorId) },
      data: {
        sponsorPersons: {
          disconnect: currentSponsor.sponsorPersons.map(person => ({ id: person.id }))
        }
      }
    });

    // Connect new persons
    const finalSponsor = await prisma.sponsor.update({
      where: { id: parseInt(sponsorId) },
      data: {
        sponsorPersons: {
          connect: userIds.map(id => ({ id: parseInt(id) }))
        }
      },
      include: {
        sponsorPersons: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    return finalSponsor;
  } catch (error) {
    console.error("Error updating sponsor persons:", error);
    throw error;
  }
};

const addSponsorDocument = async (sponsorId, documentData) => {
  return prisma.sponsorDocument.create({
    data: {
      ...documentData,
      sponsorId: parseInt(sponsorId)
    }
  });
};

const deleteSponsor = async (id) => {
  // First delete all associated documents
  await prisma.sponsorDocument.deleteMany({
    where: { sponsorId: parseInt(id) }
  });

  // Then delete the sponsor
  return prisma.sponsor.delete({
    where: { id: parseInt(id) }
  });
};

const bulkUpdateSponsorDisplayOrder = async (updates) => {
  // First, get all sponsor IDs to validate existence
  const sponsorIds = updates.map(update => parseInt(update.id));
  const existingSponsors = await prisma.sponsor.findMany({
    where: {
      id: {
        in: sponsorIds
      }
    },
    select: {
      id: true
    }
  });

  // Check if all sponsors exist
  const existingIds = existingSponsors.map(sponsor => sponsor.id);
  const missingIds = sponsorIds.filter(id => !existingIds.includes(id));

  if (missingIds.length > 0) {
    throw new Error(`Sponsors not found with IDs: ${missingIds.join(', ')}`);
  }

  // Use a transaction to ensure all updates succeed or none do
  return prisma.$transaction(
    updates.map(update => 
      prisma.sponsor.update({
        where: { id: parseInt(update.id) },
        data: { displayOrder: parseInt(update.displayOrder) }
      })
    )
  );
};

const updateSponsorDisplayOrder = async (id, displayOrder) => {
  return prisma.sponsor.update({
    where: { id: parseInt(id) },
    data: { displayOrder: parseInt(displayOrder) },
    include: {
      sponsorType: true,
      sponsorPersons: true,
      documents: true
    }
  });
};

const getAllSponsors = async (page = 1, limit = 10, sponsorTypeId = null) => {
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where = sponsorTypeId ? {
    sponsorTypeId: parseInt(sponsorTypeId)
  } : {};

  // Get total count
  const total = await prisma.sponsor.count({ where });

  // Get sponsors with pagination
  const sponsors = await prisma.sponsor.findMany({
    where,
    skip,
    take: limit,
    include: {
      sponsorType: true,
      sponsorPersons: true,
      documents: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });

  return {
    total,
    sponsors,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    hasNextPage: skip + limit < total,
    hasPreviousPage: page > 1
  };
};

// Get sponsors by event with limit
const getSponsorsByEvent = async (eventId, limit = null) => {
  return prisma.sponsor.findMany({
    where: {
      sponsorType: {
        eventId: parseInt(eventId)
      }
    },
    ...(limit && { take: limit }),
    include: {
      sponsorType: true,
      sponsorPersons: true,
      documents: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });
};

module.exports = {
  createSponsor,
  findSponsorById,
  findSponsorsByEventId,
  updateSponsor,
  addSponsorPersons,
  addSponsorDocument,
  deleteSponsor,
  bulkUpdateSponsorDisplayOrder,
  updateSponsorDisplayOrder,
  getAllSponsors,
  getSponsorsByEvent
}; 