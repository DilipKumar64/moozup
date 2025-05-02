const prisma = require("../config/prisma");

const createUser = (data) => prisma.auth.create({ data });
const findUserByEmail = (email) => prisma.auth.findUnique({ where: { email } });

module.exports = {
  createUser,
  findUserByEmail,
};
