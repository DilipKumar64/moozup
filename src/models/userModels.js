const prisma = require("../config/prisma");

const createUser = (data) => prisma.user.create({ data });
const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });
const findUserById = (id) => prisma.user.findUnique({ where: { id: parseInt(id) } });
const updateUser = (id, data) => prisma.user.update({
  where: { id: parseInt(id) },
  data
});
const deleteUser = (id) => prisma.user.delete({
  where: { id: parseInt(id) }
});

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
};
