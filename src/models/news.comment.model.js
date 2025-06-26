const prisma = require("../config/prisma");

const createNewsComment = (data) => prisma.newsComment.create({ data });

const findNewsCommentById = (id) => prisma.newsComment.findUnique({
  where: { id: parseInt(id) },
  include: {
    attendee: true,
    likes: true,
    replies: true
  }
});

const findCommentsByPostId = (postId) => prisma.newsComment.findMany({
  where: { postId: parseInt(postId), parentId: null },
  orderBy: { createdAt: 'asc' },
  include: {
    attendee: true,
    likes: true,
    replies: true
  }
});

const findRepliesByCommentId = (commentId) => prisma.newsComment.findMany({
  where: { parentId: parseInt(commentId) },
  orderBy: { createdAt: 'asc' },
  include: {
    attendee: true,
    likes: true
  }
});

const likeNewsComment = (commentId, attendeeId) => prisma.newsCommentLike.create({
  data: { commentId: parseInt(commentId), attendeeId: parseInt(attendeeId) }
});

const unlikeNewsComment = (commentId, attendeeId) => prisma.newsCommentLike.delete({
  where: { commentId_attendeeId: { commentId: parseInt(commentId), attendeeId: parseInt(attendeeId) } }
});

module.exports = {
  createNewsComment,
  findNewsCommentById,
  findCommentsByPostId,
  findRepliesByCommentId,
  likeNewsComment,
  unlikeNewsComment
}; 