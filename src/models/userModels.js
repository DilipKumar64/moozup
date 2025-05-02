const prisma = require("../config/prisma");

const createUser = (data) => prisma.user.create({ data });
const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });

module.exports = {
  createUser,
  findUserByEmail,
};
