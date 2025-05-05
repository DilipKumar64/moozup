const {
  findCategoryByName,
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategoryById,
} = require("../models/eventCategoryModel");

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, count } = req.body; // Destructure the request body

    if (!categoryName || categoryName.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await findCategoryByName(categoryName); // Check if the category already exists
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await createCategory(categoryName, count); // Create the new category
    // Return success response with created eventCategory data
    res.status(201).json({
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await getAllCategories(); // Fetch all categories
    res
      .status(200)
      .json({ message: "Categories fetched successfully.", categories }); // Return success response with categories data
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// ✅ Get single category by ID
exports.getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category fetched", data: category });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching category: " + error.message });
  }
};

// ✅ Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, count } = req.body;

    const updated = await updateCategory(id, categoryName, count);
    res.status(200).json({ message: "Category updated", data: updated });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating category: " + error.message });
  }
};

// ✅ Delete category by ID (if needed in the future)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await deleteCategoryById(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting category: " + error.message });
  }
};
