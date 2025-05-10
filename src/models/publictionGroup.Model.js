const prisma = require("../config/prisma");

const createGroupWithDocument = async ({ name, publicationsItem = [] }) => {
  if (!name || publicationsItem.length === 0) {
    throw new Error("Group name and at least one Document ID is required");
  }

  return await prisma.$transaction(async (tx) => {
    const PublicationsGroup = await tx.PublicationsGroup.create({
      data: { name },
    });

    const updatedItems = await Promise.all(
      publicationsItem.map((itemId) =>
        tx.publicationsItem.update({
          where: { id: itemId },
          data: { publicationsGroupId: PublicationsGroup.id },
        })
      )
    );

    return {
      ...PublicationsGroup,
      featuredImage: updatedItems[0],
      allDocument: updatedItems,
    };
  });
};

const findAllGroup = () =>
  prisma.publicationsGroup.findMany({
      include: {
      PublicationsItem: true,
    },
    
    orderBy: {
      createdAt: 'desc',
    },
  });


module.exports = {
    createGroupWithDocument,
    findAllGroup

}
