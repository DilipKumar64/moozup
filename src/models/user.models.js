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

const updateUserPassword = async (userId, hashedPassword) => {
  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { password: hashedPassword }
  });
};

const findUsersByEventId = (eventId) => prisma.user.findMany({
  where: {
    participationType: {
      eventId: parseInt(eventId)
    }
  },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phoneNumber: true,
    companyName: true,
    jobTitle: true,
    profilePicture: true,
    facebookUrl: true,
    twitterUrl: true,
    linkedinUrl: true,
    participationType: {
      select: {
        personParticipationType: true,
        groupParticipationName: true
      }
    }
  }
});

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
  findUsersByEventId
};
