const prisma = require("../config/prisma");

const createCollaborator = async ({ fullName, email, role, eventId, userId }) => {
  return await prisma.collaborator.create({
    data: {
      fullName,
      email,
      role,
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    },
  });
};


// Get all collaborators for a specific event and user
const getAllCollaborators = async () => {
  return await prisma.collaborator.findMany()
};

// Find event by ID
const findEventById = (id) => {
  return prisma.collaborator.findUnique({
    where: { id: Number(id) },
  });
};

const deleteCollaborator = (id)=>{
    return prisma.collaborator.delete({
        where: { id: Number(id) },
    });
}

module.exports={
    createCollaborator,
    getAllCollaborators,
    findEventById,
    deleteCollaborator
}
