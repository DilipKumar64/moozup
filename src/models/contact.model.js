const prisma = require("../config/prisma");

exports.createContact = async (contactData) => {
  return await prisma.user.create({
    data: contactData,
  });
};

exports.getAllContacts = async () => {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

