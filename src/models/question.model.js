const prisma = require("../config/prisma");

const createQuestion = (data) => prisma.question.create({
  data,
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    }
  }
});

const updateQuestion = (id, data) => prisma.question.update({
  where: { id: parseInt(id) },
  data,
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    }
  }
});

const findQuestionById = (id) => prisma.question.findUnique({
  where: { id: parseInt(id) },
  include: {
    session: true,
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    }
  }
});

module.exports = {
  createQuestion,
  updateQuestion,
  findQuestionById
}; 