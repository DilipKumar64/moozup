const xlsx = require("xlsx");

// Generate a blank Excel buffer for template download
exports.generateTemplate = (fields) => {
  const worksheet = xlsx.utils.json_to_sheet([], { header: fields });
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
  return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
};

// Parse Excel buffer to JSON
exports.parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
};

// Convert JSON to Excel buffer
exports.jsonToExcelBuffer = (data) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Export");
  return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
};