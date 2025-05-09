const prisma = require("../config/prisma");

const createUser = (data) => prisma.user.create({ data });
const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });
const findUserById = (id) => prisma.user.findUnique({ where: { id: parseInt(id) } });
const updateUser = (id, data) => prisma.user.update({
  where: { id: parseInt(id) },
  data
});
const deleteUser = (id) => prisma.user.delete({
  where: { id: parseInt(id) }
});

const updateUserPassword = async (userId, hashedPassword) => {
  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { password: hashedPassword }
  });
};

const findUsersByEventId = (eventId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  return prisma.$transaction([
    prisma.user.count({
      where: {
        participationType: {
          eventId: parseInt(eventId)
        }
      }
    }),
    prisma.user.findMany({
      where: {
        participationType: {
          eventId: parseInt(eventId)
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        companyName: true,
        jobTitle: true,
        profilePicture: true,
        facebookUrl: true,
        twitterUrl: true,
        linkedinUrl: true,
        participationType: {
          select: {
            personParticipationType: true,
            groupParticipationName: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        displayOrder: 'asc'
      }
    })
  ]);
};

const findUsersByParticipationTypeId = (participationTypeId) => prisma.user.findMany({
  where: {
    participationTypeId: parseInt(participationTypeId)
  },
  select: {
    id: true,
    firstName: true,
    email: true,
    displayOrder: true
  },
  orderBy: {
    displayOrder: 'asc'
  }
});

const bulkDeleteUsers = async (userIds) => {
  return await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds.map(id => parseInt(id))
      }
    }
  });
};

const bulkUpdateDisplayOrder = async (updates) => {
  // updates should be an array of { id: number, displayOrder: number }
  const operations = updates.map(update => 
    prisma.user.update({
      where: { id: parseInt(update.id) },
      data: { displayOrder: parseInt(update.displayOrder) }
    })
  );

  return await prisma.$transaction(operations);
};

const updateUserDisplayOrder = async (id, displayOrder) => {
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: { displayOrder: parseInt(displayOrder) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      displayOrder: true
    }
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
  findUsersByEventId,
  findUsersByParticipationTypeId,
  bulkDeleteUsers,
  bulkUpdateDisplayOrder,
  updateUserDisplayOrder
};
