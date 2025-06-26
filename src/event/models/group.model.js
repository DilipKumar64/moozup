const prisma = require("../../config/prisma");

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

    return {
      ...galleryGroup,
      featuredImage: updatedItems[0],
      allImages: updatedItems,
    };
  });
};

const getGroupById = async (groupId) => {
  const group = await prisma.galleryGroup.findUnique({
    where: { id: parseInt(groupId) },
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

const deleteGroupById = async (groupId) => {
  const id = parseInt(groupId);

  return await prisma.$transaction(async (tx) => {
    const group = await tx.galleryGroup.findUnique({ where: { id } });

    if (!group) {
      throw new Error("Group not found");
    }

    // Remove groupId from associated gallery items
    await tx.galleryItem.updateMany({
      where: { groupId: id },
      data: { groupId: null },
    });

    // Delete the group
    await tx.galleryGroup.delete({ where: { id } });

    return { message: "Group deleted successfully", groupId: id };
  });
};

module.exports = {
  createGroupWithImages,
  getGroupById,
  findAllGroup,
  deleteGroupById
};
