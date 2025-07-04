const prisma = require("../config/prisma");

const createQuestion = (data) => prisma.question.create({
  data,
  include: {
    attendee: { 
      select: {
        id: true,
        eventId: true,
        user:  {
          select :{
            id: true,
            firstName: true,
            lastName:true,
            profilePicture: true
          }
        }
      }
    }
  }
});

const updateQuestion = (id, data) => prisma.question.update({
  where: { id: parseInt(id) },
  data,
  include: {
    attendee: { 
      select: {
        id: true,
        eventId: true,
        user:  {
          select :{
            id: true,
            firstName: true,
            lastName:true,
            profilePicture: true
          }
        }
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

const checkQuestionExists =(id)=> prisma.question.findUnique({
  where : {id : id},
  include: false
})
module.exports = {
  createQuestion,
  updateQuestion,
  findQuestionById,
  checkQuestionExists
}; 