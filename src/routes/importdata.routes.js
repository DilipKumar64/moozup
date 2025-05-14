// src/routes/contact.routes.js
const express = require("express");
const router = express.Router();
const uploadFields = require("../middlewares/upload.middleware2");
const { importContacts, exportContactsAsExcel } = require("../controllers/importData.controller");

router.post("/importContacts", uploadFields.contactExcel, importContacts);
router.get("/downloadContactsExcel",exportContactsAsExcel)

module.exports = router;
