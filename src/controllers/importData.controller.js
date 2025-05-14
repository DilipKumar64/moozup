const { generateTemplate, parseExcel, jsonToExcelBuffer } = require("../utils/excel.helper");
const prisma = require("../config/prisma");



const contactFields = [
  "participantType",
  "title",
  "firstName",
  "lastName",
  "companyName",
  "jobTitle",
  "email",
  "phoneNumber",
  "imageUrl",
  "description",
  "location",
  "facebook",
  "linkedin",
  "twitter",
  "webProfile",
  "uid",
];


exports.downloadContactTemplate = async (req, res) => {
  const buffer = generateTemplate(contactFields);
  res.setHeader("Content-Disposition", "attachment; filename=contact_template.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
};


exports.importContacts = async (req, res) => {
  try {
    const file = req.files?.excelSheet?.[0];
    if (!file) return res.status(400).json({ message: "Excel file required." });

    const contacts = parseExcel(file.buffer);
    const createdContacts = await prisma.contact.createMany({ data: contacts });

    res.status(200).json({ message: "Contacts imported", count: createdContacts.count });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: "Failed to import contacts", error: error.message });
  }
};

exports.exportContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany();
    const buffer = jsonToExcelBuffer(contacts);

    res.setHeader("Content-Disposition", "attachment; filename=contacts_export.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Failed to export contacts", error: error.message });
  }
};