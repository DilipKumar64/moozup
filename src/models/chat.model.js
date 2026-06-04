const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Find or create a chat between two attendees
const findOrCreateChat = async (attendeeId1, attendeeId2) => {
  try {
    // First, try to find an existing chat between these two attendees
    const existingChat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            attendeeId: {
              in: [attendeeId1, attendeeId2]
            }
          }
        },
        AND: {
          participants: {
            some: {
              attendeeId: attendeeId1
            }
          },
          participants: {
            some: {
              attendeeId: attendeeId2
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            attendee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (existingChat) {
      return existingChat;
    }

    // If no existing chat, create a new one
    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { attendeeId: attendeeId1 },
            { attendeeId: attendeeId2 }
          ]
        }
      },
      include: {
        participants: {
          include: {
            attendee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return newChat;
  } catch (error) {
    console.error('Error in findOrCreateChat:', error);
    throw error;
  }
};

// Create a new message
const createMessage = async (chatId, senderId, content, messageType = 'TEXT', attachments = []) => {
  try {
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content,
        messageType,
        attachments: {
          create: attachments.map(attachment => ({
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize
          }))
        }
      },
      include: {
        sender: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            }
          }
        },
        attachments: true
      }
    });

    return message;
  } catch (error) {
    console.error('Error in createMessage:', error);
    throw error;
  }
};

// Get chat messages with pagination
const getChatMessages = async (chatId, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        sender: {
            select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            }
          }
        },
        attachments: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalMessages = await prisma.chatMessage.count({
      where: { chatId }
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      }
    };
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    throw error;
  }
};

// Get all chats for an attendee
const getAttendeeChats = async (attendeeId) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            attendeeId: attendeeId
          }
        }
      },
      include: {
        participants: {
          include: {
            attendee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                }
              }
            },
            attachments: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return chats;
  } catch (error) {
    console.error('Error in getAttendeeChats:', error);
    throw error;
  }
};

// Mark messages as read
const markMessagesAsRead = async (chatId, attendeeId) => {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: attendeeId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    throw error;
  }
};

// Get unread message count for an attendee
const getUnreadMessageCount = async (attendeeId) => {
  try {
    const count = await prisma.chatMessage.count({
      where: {
        chat: {
          participants: {
            some: {
              attendeeId: attendeeId
            }
          }
        },
        senderId: { not: attendeeId },
        isRead: false
      }
    });

    return count;
  } catch (error) {
    console.error('Error in getUnreadMessageCount:', error);
    throw error;
  }
};

// Check if attendee exists
const checkAttendeeExists = async (attendeeId) => {
  try {
    const attendee = await prisma.eventAttendee.findUnique({
      where: { id: attendeeId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });
    return attendee;
  } catch (error) {
    console.error('Error in checkAttendeeExists:', error);
    throw error;
  }
};

// Get attendees that can be chatted with (excluding current user)
const getChattableAttendees = async (eventId, currentAttendeeId, searchQuery = null) => {
  try {
    // Build the where clause
    const whereClause = {
      eventId: parseInt(eventId),
      id: {
        not: parseInt(currentAttendeeId)
      }
    };

    // Add search functionality if searchQuery is provided
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.trim().toLowerCase();
      whereClause.user = {
        OR: [
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            AND: [
              {
                firstName: {
                  contains: searchTerm.split(' ')[0],
                  mode: 'insensitive'
                }
              },
              {
                lastName: {
                  contains: searchTerm.split(' ')[1] || '',
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      };
    }

    const attendees = await prisma.eventAttendee.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    });

    // Format the response for chat tiles
    const formattedAttendees = attendees.map(attendee => ({
      attendeeId: attendee.id,
      firstName: attendee.user?.firstName || 'Unknown',
      lastName: attendee.user?.lastName || 'User',
      profilePicture: attendee.user?.profilePicture || null,
      fullName: `${attendee.user?.firstName || 'Unknown'} ${attendee.user?.lastName || 'User'}`.trim()
    }));

    return formattedAttendees;
  } catch (error) {
    console.error('Error in getChattableAttendees:', error);
    throw error;
  }
};

module.exports = {
  findOrCreateChat,
  createMessage,
  getChatMessages,
  getAttendeeChats,
  markMessagesAsRead,
  getUnreadMessageCount,
  checkAttendeeExists,
  getChattableAttendees
}; 