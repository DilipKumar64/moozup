const prisma = require("../../config/prisma");

// Create a new poll
const createPoll = async (data) => {
  try {
    return await prisma.poll.create({
      data: {
        question: data.question,
        passCode: data.passCode,
        pollsLimit: data.pollsLimit,
        answerType: data.answerType,
        show: data.show || false,
        sessionId: parseInt(data.sessionId),
        options: {
          create: data.options
        }
      },
      include: {
        options: true
      }
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

// Find poll by ID
const findPollById = async (id) => {
  try {
    return await prisma.poll.findUnique({
      where: { id: parseInt(id) },
      include: {
        options: true,
        responses: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            option: true
          }
        },
        session: true
      }
    });
  } catch (error) {
    console.error('Error finding poll:', error);
    throw error;
  }
};

// Find polls by event ID
const findPollsByEventId = async (eventId) => {
  try {
    // First get all sessions for this event
    const sessions = await prisma.session.findMany({
      where: { eventId: parseInt(eventId) },
      select: { id: true }
    });

    if (sessions.length === 0) {
      return [];
    }

    const sessionIds = sessions.map(session => session.id);

    // Get all polls for these sessions
    const polls = await prisma.poll.findMany({
      where: {
        sessionId: {
          in: sessionIds
        }
      },
      include: {
        options: {
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add response counts to each option
    return polls.map(poll => ({
      ...poll,
      options: poll.options.map(option => ({
        ...option,
        responseCount: option.responses.length,
        responses: option.responses.map(response => ({
          userId: response.user.id,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          respondedAt: response.createdAt
        }))
      })),
      totalResponses: poll.options.reduce((sum, option) => sum + option.responses.length, 0)
    }));
  } catch (error) {
    console.error('Error finding polls by event:', error);
    throw error;
  }
};

// Find polls by session ID
const findPollsBySessionId = async (sessionId) => {
  try {
    return await prisma.poll.findMany({
      where: { sessionId: parseInt(sessionId) },
      include: {
        options: {
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        session: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (error) {
    console.error('Error finding polls by session:', error);
    throw error;
  }
};

// Update poll
const updatePoll = async (id, data) => {
  try {
    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create update data object with only provided fields
      const updateData = {};
      
      // Only include fields that are provided
      if (data.question !== undefined) updateData.question = data.question;
      if (data.passCode !== undefined) updateData.passCode = data.passCode;
      if (data.pollsLimit !== undefined) updateData.pollsLimit = data.pollsLimit;
      if (data.answerType !== undefined) updateData.answerType = data.answerType;
      if (data.show !== undefined) updateData.show = data.show;

      // Update the poll
      const updatedPoll = await tx.poll.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          options: true,
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              option: true
            }
          },
          session: true
        }
      });

      // Only handle options if new options are provided
      if (data.options && Array.isArray(data.options) && data.options.length > 0) {
        // First, get all options for this poll
        const existingOptions = await tx.option.findMany({
          where: { pollId: parseInt(id) },
          select: { id: true }
        });

        const optionIds = existingOptions.map(option => option.id);

        // Delete all poll responses for these options
        if (optionIds.length > 0) {
          await tx.pollResponse.deleteMany({
            where: {
              optionId: {
                in: optionIds
              }
            }
          });
        }

        // Now we can safely delete the options
        await tx.option.deleteMany({
          where: { pollId: parseInt(id) }
        });

        // Create new options
        const optionsToCreate = data.options.map(optionText => ({
          text: optionText,
          pollId: parseInt(id)
        }));

        await tx.option.createMany({
          data: optionsToCreate
        });

        // Fetch the final updated poll with all relations
        return await tx.poll.findUnique({
          where: { id: parseInt(id) },
          include: {
            options: true,
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                },
                option: true
              }
            },
          }
        });
      }

      return updatedPoll;
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    throw error;
  }
};

// Delete poll
const deletePoll = async (id) => {
  try {
    return await prisma.poll.delete({
      where: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    throw error;
  }
};

// Add poll response
const addPollResponse = async (pollId, userId, optionId) => {
  try {
    // First check if user has already responded to this option
    const existingResponse = await prisma.pollResponse.findFirst({
      where: {
        pollId: parseInt(pollId),
        userId: parseInt(userId),
        optionId: parseInt(optionId)
      }
    });

    if (existingResponse) {
      throw new Error('User has already responded to this option');
    }

    // Create new response
    return await prisma.pollResponse.create({
      data: {
        pollId: parseInt(pollId),
        userId: parseInt(userId),
        optionId: parseInt(optionId)
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        option: true
      }
    });
  } catch (error) {
    console.error('Error adding poll response:', error);
    throw error;
  }
};

// Get poll results
const getPollResults = async (pollId) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(pollId) },
      include: {
        options: {
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    // Calculate results
    const results = poll.options.map(option => ({
      optionId: option.id,
      text: option.text,
      count: option.responses.length,
      responses: option.responses.map(response => ({
        userId: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        respondedAt: response.createdAt
      }))
    }));

    return {
      pollId: poll.id,
      question: poll.question,
      totalResponses: results.reduce((sum, option) => sum + option.count, 0),
      results
    };
  } catch (error) {
    console.error('Error getting poll results:', error);
    throw error;
  }
};

// End poll
const endPoll = async (id) => {
  try {
    return await prisma.poll.delete({
      where: { id: parseInt(id) }
    });
  } catch (error) {
    console.error('Error ending poll:', error);
    throw error;
  }
};

// Get polls for a session
const getSessionPolls = async (sessionId) => {
  try {
    return await prisma.poll.findMany({
      where: {
        sessionId: parseInt(sessionId)
      },
      include: {
        options: {
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting session polls:', error);
    throw error;
  }
};

module.exports = {
  createPoll,
  findPollById,
  findPollsBySessionId,
  findPollsByEventId,
  updatePoll,
  deletePoll,
  addPollResponse,
  getPollResults,
  endPoll,
  getSessionPolls
}; 