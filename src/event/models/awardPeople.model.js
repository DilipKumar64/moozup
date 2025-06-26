const prisma = require("../../config/prisma");

// Create Awarded Person
const createAwardedPerson = (data) => {
  return prisma.awardedPerson.create({
    data,
  });
};

// Get all Awarded Persons and include eventDate from the Event model
const getAllAwardedPersons = () => {
  return prisma.awardedPerson.findMany({
    include: {
      event: {
        select: {
          eventStartDate: true, // Include eventDate field from Event model
        },
      },
      session: {
        select: {
          title: true, // Include sessionName field from Session model
        },
      },
      awardType: {
        select: {
          awardType: true, // Include awardTypeName field from AwardType model
        },
      },
    },
  });
};

// Get Awarded Person by ID
const getAwardedPersonById = (id) => {
  return prisma.awardedPerson.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          eventStartDate: true, // Include eventDate field from Event model
        },
      },
      session: {
        select: {
          title: true, // Include sessionName field from Session model
        },
      },
      awardType: {
        select: {
          awardType: true, // Include awardTypeName field from AwardType model
        },
      },
    },
  });
};

// Update Awarded Person by ID
const updateAwardedPerson = (id, data) => {
  return prisma.awardedPerson.update({
    where: { id },
    data,
  });
};

// Delete Awarded Person by ID (if needed)

const deleteAwardedPersonById = (id) => {
  return prisma.awardedPerson.delete({
    where: { id },
  });
};

module.exports = {
  createAwardedPerson,
  getAllAwardedPersons,
  getAwardedPersonById,
  updateAwardedPerson,
  deleteAwardedPersonById,
  // Add other functions as needed
};
