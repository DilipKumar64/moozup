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

module.exports = {
  createPublicationItem,
  getPublicationItems,
  // getGalleryItems,
};
