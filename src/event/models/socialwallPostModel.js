const prisma = require("../../config/prisma");


exports.createPost = async ({ content, images, shareOn, userId, eventId }) => {
  return await prisma.post.create({
    data: {
      content,
      images,
      shareOn,
      userId: Number(userId),
      eventId: Number(eventId),
    },
  });
};

exports.getEventUsers = async (eventId) => {
  return await prisma.event.findUnique({
    where: { id: Number(eventId) },
    include: {
      UserEvent: {
        include: {
          user: true,  // fetch user details inside user-event relation
        },
      },
    },
  });
};



exports.getPostsByEvent = async (eventId) => {
  return await prisma.post.findMany({
    where: { eventId },
    include: {
      user: true,
      event: true,
      comments: {
        include: { user: true }
      },
      _count: {
        select: { likes: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

exports.createNotification = async ({ message, recipientId }) => {
  return await prisma.notification.create({
    data: { message, recipientId }
  });
};

exports.getPostById = async (postId) => {
  return await prisma.post.findUnique({
    where: { id: Number(postId) },
    include: {
      likes: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      },
      comments: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      }
    }
  });
};




exports.createLike = async ({ postId, userId }) => {
  return await prisma.like.create({
    data: { postId, userId }
  });
};
