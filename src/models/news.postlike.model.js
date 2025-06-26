const prisma = require("../config/prisma");

const findLikesByPostIdsAndAttendee = (postIds, attendeeId) =>
  prisma.newsPostLike.findMany({
    where: {
      postId: { in: postIds },
      attendeeId: parseInt(attendeeId)
    }
  });

const countLikesForPost = (postId) =>
  prisma.newsPostLike.count({
    where: { postId: parseInt(postId) }
  });

const groupLikeCountsByPostIds = (postIds) =>
  prisma.newsPostLike.groupBy({
    by: ['postId'],
    _count: { postId: true },
    where: { postId: { in: postIds } }
  });

module.exports = {
  findLikesByPostIdsAndAttendee,
  countLikesForPost,
  groupLikeCountsByPostIds
}; 