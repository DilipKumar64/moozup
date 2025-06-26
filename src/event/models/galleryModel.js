// const prisma = new PrismaClient();

const prisma = require("../../config/prisma");

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

const deleteGalleryItem = async (id) => {
  return await prisma.galleryItem.delete({
    where: {
      id: parseInt(id),
    },
  });
};

const getGalleryItemById = async (id) => {
  return await prisma.galleryItem.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};



module.exports = {
  createGalleryItem,
  getGalleryItems,
  deleteGalleryItem,
  getGalleryItemById
};
