const prisma = require("../config/prisma");

const createNewsPost = (data) => prisma.newsPost.create({ data });

const findNewsPostById = (id) => prisma.newsPost.findUnique({
  where: { id: parseInt(id) },
  include: {
    attendee: true,
    likes: true,
    comments: true
  }
});

const findNewsPosts = (filter = {}) => prisma.newsPost.findMany({
  where: filter,
  orderBy: { createdAt: 'desc' },
  include: {
    attendee: true,
    likes: true,
    comments: true
  }
});

const deleteNewsPost = (id) => prisma.newsPost.delete({
  where: { id: parseInt(id) }
});

const likeNewsPost = (postId, attendeeId) => prisma.newsPostLike.create({
  data: { postId: parseInt(postId), attendeeId: parseInt(attendeeId) }
});

const unlikeNewsPost = (postId, attendeeId) => prisma.newsPostLike.delete({
  where: { postId_attendeeId: { postId: parseInt(postId), attendeeId: parseInt(attendeeId) } }
});

const incrementShareCount = (postId) => prisma.newsPost.update({
  where: { id: parseInt(postId) },
  data: { shares: { increment: 1 } }
});

const getNewsPostsByEvent = (eventId, skip = 0, take = 10) =>
  prisma.newsPost.findMany({
    where: { attendee: { eventId: parseInt(eventId) } },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    select: {
      id: true,
      description: true,
      images: true,
      createdAt: true,
      updatedAt: true,
      attendeeId: true,
      shares: true,
      attendee: {
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              profilePicture: true
            }
          }
        }
      },
      comments: {
        select: {
          id: true,
          postId: true,
          attendeeId: true,
          content: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
          attendee: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  profilePicture: true
                }
              }
            }
          }
        }
      }
    }
  });

const checkPostExitst = (id)=>{
  return prisma.newsPost.findFirst({
    where: {
      id: id
    }, 
    include: false
  }
  )
}

module.exports = {
  createNewsPost,
  findNewsPostById,
  findNewsPosts,
  deleteNewsPost,
  likeNewsPost,
  unlikeNewsPost,
  incrementShareCount,
  getNewsPostsByEvent,
  checkPostExitst
}; 