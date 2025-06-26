// src/routes/contact.routes.js
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/importData.controller");
const uploadFields = require("../../middlewares/upload.middleware2");

router.get("/download-template", contactController.downloadContactTemplate);
router.post("/import", uploadFields.contactExcel, contactController.importContacts);
router.get("/export", contactController.exportContacts);

module.exports = router;
