const prisma = require("../config/prisma");

const findLikesByCommentIdsAndAttendee = (commentIds, attendeeId) => {
  if (!commentIds || commentIds.length === 0) {
    return [];
  }
  return prisma.socialCommentLike.findMany({
    where: {
      commentId: { in: commentIds },
      attendeeId: parseInt(attendeeId)
    }
  });
};

const countLikesForComment = (commentId) =>
  prisma.socialCommentLike.count({
    where: { commentId: parseInt(commentId) }
  });

const groupLikeCountsByCommentIds = (commentIds) => {
  if (!commentIds || commentIds.length === 0) {
    return [];
  }
  return prisma.socialCommentLike.groupBy({
    by: ['commentId'],
    _count: { commentId: true },
    where: { commentId: { in: commentIds } }
  });
};

module.exports = {
  findLikesByCommentIdsAndAttendee,
  countLikesForComment,
  groupLikeCountsByCommentIds
}; 