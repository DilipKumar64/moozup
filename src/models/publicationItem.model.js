const prisma = require("../config/prisma");

const createPublicationItem = async ({
  message,
  fileUrl,
  publicationsGroupId,
  eventId,
  userId,
}) => {
  return await prisma.publicationsItem.create({
    data: {
      message,
      fileUrl,
      publicationsGroupId: parseInt(publicationsGroupId),
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    },
  });
};

const getPublicationItems = async () => {
  return await prisma.publicationsItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      publicationsGroup: true,
    },
  });
};

const getPublicationItemsByEventId = async (eventId) => {
  return await prisma.publicationsItem.findMany({
    where: {
      eventId: parseInt(eventId),
    },
    include: {
      publicationsGroup: true,
    },
  });
};

const deletePublicationItemById = async (id) => {
  return await prisma.publicationsItem.delete({
    where: { id: parseInt(id) },
  });
};


module.exports = {
  createPublicationItem,
  getPublicationItems,
  getPublicationItemsByEventId,
  deletePublicationItemById
};
