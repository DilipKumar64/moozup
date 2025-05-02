const prisma = require("../config/prisma");

const createEvent = async (data) => {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: {
        title_date: {
          title: data.title,
          date: data.date,
        },
      },
    });

    if (existingEvent) {
      throw new Error("Event with this title and date already exists.");
    }

    const event = await prisma.event.create({ data });
    return event;
  } catch (error) {
    throw new Error("Error creating event: " + error.message);
  }
};

const findAllEvents = () => prisma.event.findMany();

const findEventById = (id) => {
  return prisma.event.findUnique({
    where: { id: Number(id) },
  });
};

const updateEventById = (id, data) => {
  return prisma.event.update({
    where: { id: Number(id) },
    data: data,
  });
};

const deleteEventById = (id) => {
    return prisma.event.delete({
      where: { id: Number(id) } 
    });
  };

module.exports = { createEvent, findAllEvents, findEventById, updateEventById, deleteEventById };
