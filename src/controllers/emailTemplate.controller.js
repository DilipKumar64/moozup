const prisma = require("../config/prisma");
const emailTemplateModel = require("../models/emailTemplate.model");
const nodemailer = require("nodemailer");

require("dotenv").config();

exports.createEmailTemplate = async (req, res) => {
  const {
    type,
    templateName,
    emailSubject,
    templateDescription,
    eventId,
    userId,
  } = req.body;

  if (
    !type ||
    !templateName ||
    !emailSubject ||
    !templateDescription ||
    !eventId ||
    !userId
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const template = await emailTemplateModel.createEmailTemplate({
      type,
      templateName,
      emailSubject,
      templateDescription,
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    });

    res.json({ message: "Template created successfully", template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create template" });
  }
};

exports.getEmailTemplateById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Plaese Add Valid Id" });
  }

  try {
    const template = await emailTemplateModel.getEmailTemplateById(id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
};

exports.getAllEmailTemplates = async (req, res) => {
  try {
    const templates = await emailTemplateModel.getAllEmailTemplates();
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
};

exports.updateEmailTemplate = async (req, res) => {
  const { id } = req.params;
  const {
    type,
    templateName,
    emailSubject,
    templateDescription,
    eventId,
    userId,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Please provide a valid ID" });
  }

  try {
    const updatedTemplate = await emailTemplateModel.updateEmailTemplate(id, {
      type,
      templateName,
      emailSubject,
      templateDescription,
      eventId: parseInt(eventId),
      userId: parseInt(userId),
    });

    res.json({ message: "Template updated successfully", updatedTemplate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update template" });
  }
};

exports.deleteEmailTemplate = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Please provide a valid ID" });
  }

  try {
    await emailTemplateModel.deleteEmailTemplate(id);
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete template" });
  }
};

// Send Test Email
exports.sendTestEmail = async (req, res) => {
  const {
    templateId,
    toEmail,
    name = "John Doe",
    conferenceName = "SEIC 2025",
    date = "12 May 2025",
    venue = "Virtual Conference",
  } = req.body;

  if (!templateId || !toEmail) {
    return res.status(400).json({ message: "templateId and toEmail are required" });
  }

  try {
    const template = await emailTemplateModel.getEmailTemplateById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Replace placeholders in both subject and description
    const finalSubject = template.emailSubject
      .replace(/\$name\$/g, name)
      .replace(/\$conferenceName\$/g, conferenceName)
      .replace(/\$date\$/g, date)
      .replace(/\$venue\$/g, venue);

    const htmlBody = template.templateDescription
      .replace(/\$name\$/g, name)
      .replace(/\$conferenceName\$/g, conferenceName)
      .replace(/\$date\$/g, date)
      .replace(/\$venue\$/g, venue);

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"SEIC" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: finalSubject,
      html: htmlBody,
    });

    res.json({ message: "Test email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send email" });
  }
};



exports.sendComposedEmails = async (req, res) => {
  const {
    templateId,
    subjectOverride,
    recipientScope,
    emailType,
    conferenceName = "SEIC 2025",
    date = "12 May 2025",
    venue = "Virtual Conference",
  } = req.body;

  if (!templateId) {
    return res.status(400).json({ message: "templateId is required" });
  }

  try {
    // 1. Get the email template
    const template = await emailTemplateModel.getEmailTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Email Template not found" });
    }

    let users = [];

    // 2. Apply recipientScope
    if (recipientScope !== "EVERYONE") {
      return res.status(400).json({ message: "Invalid recipientScope value." });
    }

    // 3. Filter users based on emailType
    users = await prisma.user.findMany({
      where: getUserFilterByEmailType(emailType),
    });

    if (!users || users.length === 0) {
      return res.json({ message: "Emails sent to 0 users." });
    }

    // 4. Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 5. Send email to each user
    for (const user of users) {
      const userName = user.firstName || "Participant";

      const finalSubject = (subjectOverride || template.emailSubject)
        .replace(/\$name\$/g, userName)
        .replace(/\$conferenceName\$/g, conferenceName)
        .replace(/\$date\$/g, date)
        .replace(/\$venue\$/g, venue);

      const htmlBody = template.templateDescription
        .replace(/\$name\$/g, userName)
        .replace(/\$conferenceName\$/g, conferenceName)
        .replace(/\$date\$/g, date)
        .replace(/\$venue\$/g, venue);

      await transporter.sendMail({
        from: `"SEIC" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: finalSubject,
        html: htmlBody,
      });
    }

    return res.json({ message: `Emails sent to ${users.length} users.` });

  } catch (error) {
    console.error("Send Composed Email Error:", error);
    return res.status(500).json({ message: "Failed to send emails", error: error.message });
  }
};

function getUserFilterByEmailType(emailType) {
  switch (emailType) {
    case "ALL":
      return {}; // All users

    case "FIRST_TIME":
      return {
        hasLoggedIn: true,
        loginCount: 1, // Only logged in once
      };

    case "NOT_LOGGED_IN":
      return {
        hasLoggedIn: false,
      };

    case "PENDING_MEETING":
      return {
        hasPendingMeeting: true,
      };

    default:
      return {}; // fallback to all users
  }
}