const prisma = require("../config/prisma");

// ✅ Create a new category
const createCategory = async (categoryName, count = 0) => {
  return await prisma.eventCategory.create({
    data: {
      categoryName,
      count: parseInt(count),
    },
  });
};

// ✅ Find category by name (case-insensitive)
const findCategoryByName = async (categoryName) => {
  return await prisma.eventCategory.findFirst({
    where: {
      categoryName: {
        equals: categoryName,
        mode: "insensitive",
      },
    },
  });
};

// ✅ Get all categories
const getAllCategories = async () => {
  return await prisma.eventCategory.findMany();
};

// ✅ Get single category by ID
const getCategoryById = async (id) => {
  return await prisma.eventCategory.findUnique({
    where: { id: parseInt(id) },
  });
};

// ✅ Update category
const updateCategory = async (id, categoryName, count) => {
  return await prisma.eventCategory.update({
    where: { id: parseInt(id) },
    data: {
      categoryName,
      count: parseInt(count),
    },
  });
};

// ✅ Delete category by ID
const deleteCategoryById = async (id) => {
  return await prisma.eventCategory.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createCategory,
  findCategoryByName,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategoryById,
  // Add other functions as needed
};
