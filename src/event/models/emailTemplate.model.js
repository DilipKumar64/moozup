const prisma = require("../../config/prisma");

const createEmailTemplate = async (data) => {
  return await prisma.emailTemplate.create({ data });
};

const getEmailTemplateById = async (id) => {
  return await prisma.emailTemplate.findUnique({
    where: { id: Number(id) }, 
  });
};

const getAllEmailTemplates = async () => {
  return await prisma.emailTemplate.findMany();
};

const updateEmailTemplate = async (id, data) => {
  return await prisma.emailTemplate.update({
      where: { id: Number(id) }, 
    data,
  });
};

const deleteEmailTemplate = async (id) => {
  return await prisma.emailTemplate.delete({
     where: { id: Number(id) },
  });
};

module.exports = {
  createEmailTemplate,
  getEmailTemplateById,
  getAllEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
};
