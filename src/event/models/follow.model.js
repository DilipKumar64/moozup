const prisma = require("../../config/prisma");

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

// Delete a follow relationship
const deleteFollow = (followerId, followingId) =>
  prisma.follow.delete({
    where: {
      followerId_followingId: { // composite unique key
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    },
  });

// Get all followers for a user
const getFollowers = (userId) =>
  prisma.follow.findMany({
    where: { followingId: parseInt(userId) },
    include: {
      follower: true, // get user details using  relation named 'follower'
    },
  });

// Get all users the current user is following
const getFollowing = (userId) =>
  prisma.follow.findMany({
    where: { followerId: parseInt(userId) },
    include: {
      following: true, // This will include the user being followed
    },
  });

module.exports = {
  createFollow,
  findFollow,
  countFollowers,
  countFollowing,
  deleteFollow,
  getFollowers,
  getFollowing,
};
