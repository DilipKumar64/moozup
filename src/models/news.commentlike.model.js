const prisma = require("../config/prisma");

const findLikesByCommentIdsAndAttendee = (commentIds, attendeeId) =>
  prisma.newsCommentLike.findMany({
    where: {
      commentId: { in: commentIds },
      attendeeId: parseInt(attendeeId)
    }
  });

const countLikesForComment = (commentId) =>
  prisma.newsCommentLike.count({
    where: { commentId: parseInt(commentId) }
  });

const groupLikeCountsByCommentIds = (commentIds) =>
  prisma.newsCommentLike.groupBy({
    by: ['commentId'],
    _count: { commentId: true },
    where: { commentId: { in: commentIds } }
  });

module.exports = {
  findLikesByCommentIdsAndAttendee,
  countLikesForComment,
  groupLikeCountsByCommentIds
}; 