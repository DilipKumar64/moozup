const prisma = require("../config/prisma");

// Create a new report
const createReport = (data) => prisma.report.create({ data });

module.exports = {
  createReport,
};
