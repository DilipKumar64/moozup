const express = require("express");
const authenticateJWT = require("../middlewares/auth.middleware");
const multer = require("multer");
const eventCategoryController = require("../controllers/eventCategory.controller");

const router = express.Router();

// Middleware to handle multipart/form-data (if needed)
router.use(multer().none());

router.post("/create-category",authenticateJWT,eventCategoryController.createCategory);
router.get("/get-all-categories",authenticateJWT,eventCategoryController.getAllCategories);
router.get("/get-single-category/:id",authenticateJWT,eventCategoryController.getSingleCategory);
router.put("/update-category/:id",authenticateJWT,eventCategoryController.updateCategory);
router.delete("/delete-category/:id",authenticateJWT,eventCategoryController.deleteCategory);

module.exports = router;
