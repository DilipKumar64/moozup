const express = require('express');
const multer = require('multer');
const router = express.Router();
const emailTemplateController = require("../controllers/emailTemplate.controller");
const authenticateJWT = require('../../middlewares/auth.middleware');

// Middleware for parsing multipart/form-data if needed
router.use(multer().none());

// 📩 Create a new email template
router.post(
  "/createEmailTemplate",
  authenticateJWT,
  emailTemplateController.createEmailTemplate
);

// 📥 Get email template by ID
router.get(
  "/:id",
  authenticateJWT,
  emailTemplateController.getEmailTemplateById
);

// 📃 Get all templates
router.get(
  "/",
  authenticateJWT,
  emailTemplateController.getAllEmailTemplates
);

// ✏️ Update template
router.put(
  "/:id",
  authenticateJWT,
  emailTemplateController.updateEmailTemplate
);

// ❌ Delete template
router.delete(
  "/:id",
  authenticateJWT,
  emailTemplateController.deleteEmailTemplate
);

// 🧪 Send test email using a template
router.post(
  "/send-test",
  authenticateJWT,
  emailTemplateController.sendTestEmail
);

router.post("/send_composeed_email", authenticateJWT, emailTemplateController.sendComposedEmails);


module.exports = router;
