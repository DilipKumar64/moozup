const prisma = require("../config/prisma");

// Create a follow relationship
const createFollow = (followerId, followingId) =>
  prisma.follow.create({
    data: {
      followerId: parseInt(followerId),
      followingId: parseInt(followingId),
    },
  });

// Check if a follow relationship exists
const findFollow = (followerId, followingId) =>
  prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    },
  });

// Count followers for a user
const countFollowers = (userId) =>
  prisma.follow.count({
    where: { followingId: parseInt(userId) },
  });

// Count following for a user
const countFollowing = (userId) =>
  prisma.follow.count({
    where: { followerId: parseInt(userId) },
  });

module.exports = {
  createFollow,
  findFollow,
  countFollowers,
  countFollowing,
};
