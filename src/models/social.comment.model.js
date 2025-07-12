const prisma = require("../config/prisma");

const createSocialComment = (data) => prisma.socialComment.create({ data });

const findSocialCommentById = (id) => prisma.socialComment.findUnique({
  where: { id: parseInt(id) },
  include: {
    attendee: true,
    likes: true,
    replies: true
  }
});

const findCommentsByPostId = (postId) => prisma.socialComment.findMany({
  where: { postId: parseInt(postId), parentId: null },
  orderBy: { createdAt: 'asc' },
  include: {
    attendee: true,
    likes: true,
    replies: true
  }
});

const findRepliesByCommentId = (commentId) => prisma.socialComment.findMany({
  where: { parentId: parseInt(commentId) },
  orderBy: { createdAt: 'asc' },
  include: {
    attendee: true,
    likes: true
  }
});

const likeSocialComment = (commentId, attendeeId) => prisma.socialCommentLike.create({
  data: { commentId: parseInt(commentId), attendeeId: parseInt(attendeeId) }
});

const unlikeSocialComment = (commentId, attendeeId) => prisma.socialCommentLike.delete({
  where: { commentId_attendeeId: { commentId: parseInt(commentId), attendeeId: parseInt(attendeeId) } }
});

const checkCommentExists = (id)=>{
  return prisma.socialComment.findFirst({
    where: {
      id: id
    },
    select : false
  })
}

module.exports = {
  createSocialComment,
  findSocialCommentById,
  findCommentsByPostId,
  findRepliesByCommentId,
  likeSocialComment,
  unlikeSocialComment,
  checkCommentExists
}; 