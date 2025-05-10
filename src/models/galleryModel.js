// const prisma = new PrismaClient();

const prisma = require("../config/prisma");

const createGalleryItem = async ({
  imagelabel,
  Videolabel,
  imageUrl,
  videoUrl,
  groupId,
  eventId,
  userId,
}) => {
  return await prisma.galleryItem.create({
    data: {
      imagelabel,
      Videolabel,
      imageUrl,
      videoUrl,
      groupId: parseInt(groupId),
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    },
  });
};

const getGalleryItems = async ({ groupId, eventId, userId }) => {
  return await prisma.galleryItem.findMany({
    where: {
      ...(groupId && { groupId }),
      ...(eventId && { eventId: parseInt(eventId) }),
      ...(userId && { userId: parseInt(userId) }),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      group: true,
    },
  });
};

module.exports = {
  createGalleryItem,
  getGalleryItems,
};
