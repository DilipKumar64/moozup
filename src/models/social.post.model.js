const prisma = require("../config/prisma");

const createSocialPost = (data) => prisma.socialPost.create({ data });

const findSocialPostById = (id) => prisma.socialPost.findUnique({
  where: { id: parseInt(id) },
  include: {
    attendee: true,
    likes: true,
    comments: true
  }
});

const findSocialPosts = (filter = {}) => prisma.socialPost.findMany({
  where: filter,
  orderBy: { createdAt: 'desc' },
  include: {
    attendee: true,
    likes: true,
    comments: true
  }
});

const deleteSocialPost = (id) => prisma.socialPost.delete({
  where: { id: parseInt(id) }
});

const likeSocialPost = (postId, attendeeId) => prisma.socialPostLike.create({
  data: { postId: parseInt(postId), attendeeId: parseInt(attendeeId) }
});

const unlikeSocialPost = (postId, attendeeId) => prisma.socialPostLike.delete({
  where: { postId_attendeeId: { postId: parseInt(postId), attendeeId: parseInt(attendeeId) } }
});

const incrementShareCount = (postId) => prisma.socialPost.update({
  where: { id: parseInt(postId) },
  data: { shares: { increment: 1 } }
});

const getSocialPostsByEvent = (eventId, skip = 0, take = 10) =>
  prisma.socialPost.findMany({
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

const checkPostExists = (id)=>{
  return prisma.socialPost.findFirst({
    where: {
      id: id
    }, 
    include: false
  })
}

module.exports = {
  createSocialPost,
  findSocialPostById,
  findSocialPosts,
  deleteSocialPost,
  likeSocialPost,
  unlikeSocialPost,
  incrementShareCount,
  getSocialPostsByEvent,
  checkPostExists
}; 