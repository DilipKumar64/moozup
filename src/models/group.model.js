const prisma = require("../config/prisma");

const createGroupWithImages = async ({ name, galleryItems = [] }) => {
  if (!name || galleryItems.length === 0) {
    throw new Error("Group name and at least one image ID is required");
  }

  return await prisma.$transaction(async (tx) => {
    const galleryGroup = await tx.galleryGroup.create({
      data: { name },
    });

    const updatedItems = await Promise.all(
      galleryItems.map((itemId) =>
        tx.galleryItem.update({
          where: { id: itemId },
          data: { groupId: galleryGroup.id },
        })
      )
    );

    // await tx.galleryGroup.update({
    //   where: { id: galleryGroup.id },
    //   data: {
    //     galleryId: updatedItems[0].id,
    //   },
    // });

    return {
      ...galleryGroup,
      featuredImage: updatedItems[0],
      allImages: updatedItems,
    };
  });
};

const getGroupById = async (groupId) => {
  const group = await prisma.galleryGroup.findUnique({
    where: { id: groupId },
    include: {
      galleryItems: true,  // Include all gallery items associated with the group
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  return group;
};

const findAllGroup = () => prisma.galleryGroup.findMany({
     include: {
      galleryItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
});

module.exports = { createGroupWithImages, getGroupById,findAllGroup };
