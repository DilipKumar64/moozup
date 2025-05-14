// src/controllers/contact.controller.js
const XLSX = require("xlsx");
const { createContact, getAllContacts } = require("../models/contact.model");

exports.importContacts = async (req, res) => {
  try {
    const excelFile = req.files["excelSheet"]?.[0];
    if (!excelFile) {
      return res.status(400).json({ message: "Excel file is required." });
    }

    const workbook = XLSX.read(excelFile.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Optional: Validate data length
    if (!data.length) return res.status(400).json({ message: "Sheet is empty" });

    await Promise.all(
      data.map(row => {
        if (!row["Name"] || !row["Email"]) return null; // Basic validation
        return createContact({
          name: row["Name"],
          email: row["Email"],
          phone: row["Phone"],
        });
      })
    );

    return res.status(200).json({ message: "Contacts imported successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Import failed", error: error.message });
  }
};


exports.exportContactsAsExcel = async (req, res) => {
  try {
    const contacts = await getAllContacts(); // from DB

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

    // Write workbook to buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=contacts.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);

  } catch (error) {
    console.error("Export Error:", error);
    return res.status(500).json({ message: "Failed to export contacts", error: error.message });
  }
};