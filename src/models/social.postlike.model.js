const prisma = require("../config/prisma");

const findLikesByPostIdsAndAttendee = (postIds, attendeeId) => {
  if (!postIds || postIds.length === 0) {
    return [];
  }
  return prisma.socialPostLike.findMany({
    where: {
      postId: { in: postIds },
      attendeeId: parseInt(attendeeId)
    }
  });
};

const countLikesForPost = (postId) =>
  prisma.socialPostLike.count({
    where: { postId: parseInt(postId) }
  });

const groupLikeCountsByPostIds = (postIds) => {
  if (!postIds || postIds.length === 0) {
    return [];
  }
  return prisma.socialPostLike.groupBy({
    by: ['postId'],
    _count: { postId: true },
    where: { postId: { in: postIds } }
  });
};

module.exports = {
  findLikesByPostIdsAndAttendee,
  countLikesForPost,
  groupLikeCountsByPostIds
}; 