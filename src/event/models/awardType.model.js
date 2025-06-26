const prisma = require("../../config/prisma");

// Create a new award type
const createAwardType = (data) => {
  return prisma.awardType.create({ data });
};

// Get all award types
const getAllAwardTypes = () => {
  return prisma.awardType.findMany();
};

// Get award type by ID
const getAwardTypeById = (id) => {
  return prisma.awardType.findUnique({ where: { id } });
};

// Update award type by ID
const updateAwardType = (id, data) => {
  return prisma.awardType.update({ where: { id }, data });
};

// Delete award type by ID (optional, if you want to implement this)
const deleteAwardTypeById = (id) => {
  return prisma.awardType.delete({ where: { id } });
};


module.exports = {
    createAwardType,
    getAllAwardTypes,
    getAwardTypeById,
    updateAwardType,
    deleteAwardTypeById,
    // Add other functions as needed
    // For example, you can add functions to get, update, and delete award types
}