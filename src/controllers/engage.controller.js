const { PrismaClient } = require('@prisma/client');
const { 
  emitSessionUpdate, 
  emitQuestionUpdate, 
  emitPollCreated, 
  emitPollUpdated, 
  emitPollResponse, 
  emitPollEnded 
} = require('../socket');
const { findSessionById, updateSessionLiveStatus, findSessionQuestions, findSessionsByDate } = require('../models/session.model');
const { createQuestion, updateQuestion, findQuestionById } = require('../models/question.model');
const { 
  createPoll, 
  findPollById, 
  findPollsBySessionId, 
  updatePoll, 
  addPollResponse, 
  getPollResults, 
  endPoll, 
  getActivePolls,
  findPollsByEventId
} = require('../models/poll.model');
const prisma = new PrismaClient();

// Validation middleware
const validateSessionExists = async (req, res, next) => {
  const { sessionId } = req.params;
  const session = await findSessionById(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  req.session = session;
  next();
};

const validateQuestionExists = async (req, res, next) => {
  const { questionId } = req.params;
  const question = await findQuestionById(questionId);
  
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  req.question = question;
  next();
};

exports.toggleSessionLive = async (req, res) => {
  const { sessionId } = req.params;
  const { isLive } = req.body;

  // Validate request body
  if (typeof isLive !== 'boolean') {
    return res.status(400).json({ error: 'isLive must be a boolean value' });
  }

  try {
    // Check if session exists
    const session = await findSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const updatedSession = await updateSessionLiveStatus(sessionId, isLive);

    // Emit to all users in the event
    emitSessionUpdate(updatedSession.event.id, {
      sessionId: updatedSession.id,
      isLive: updatedSession.isLive,
      wentLiveAt: updatedSession.wentLiveAt,
      sessionName: updatedSession.title,
      eventId: updatedSession.event.id
    });

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Error toggling session live status:', error);
    res.status(500).json({ error: 'Failed to update session status' });
  }
};

exports.createQuestion = async (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  // Validate request body
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Question content is required and must be a non-empty string' });
  }

  try {
    // Check if session exists
    const session = await findSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const question = await createQuestion({
      content: content.trim(),
      sessionId: parseInt(sessionId),
      userId
    });

    // Emit to all users in the session
    emitQuestionUpdate(sessionId, {
      type: 'new',
      question
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

exports.updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { status, editedContent } = req.body;

  // Validate request body
  if (!status || !['pending', 'approved', 'declined'].includes(status)) {
    return res.status(400).json({ 
      error: 'Status is required and must be one of: pending, approved, declined' 
    });
  }

  if (editedContent && typeof editedContent !== 'string') {
    return res.status(400).json({ error: 'Edited content must be a string' });
  }

  try {
    // Check if question exists
    const existingQuestion = await findQuestionById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = await updateQuestion(questionId, {
      status,
      editedContent: editedContent ? editedContent.trim() : undefined
    });

    // Emit to all users in the session
    emitQuestionUpdate(question.sessionId, {
      type: 'update',
      question
    });

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

exports.getSessionQuestions = async (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.query;

  // Validate query parameters
  if (status && !['pending', 'approved', 'declined'].includes(status)) {
    return res.status(400).json({ 
      error: 'Status must be one of: pending, approved, declined' 
    });
  }

  try {
    // Check if session exists
    const session = await findSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const questions = await findSessionQuestions(sessionId, status);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

exports.getSessionsByDate = async (req, res) => {
  const { date, eventId } = req.query;

  // Enforce eventId is required
  if (!eventId) {
    return res.status(400).json({ error: 'eventId is required' });
  }
  if (date && !Date.parse(date)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD format' });
  }

  try {
    const sessions = await findSessionsByDate(date, eventId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Poll Controller Functions
exports.createPoll = async (req, res) => {
  const { sessionId } = req.params;
  const { question, passCode, pollsLimit, answerType, options, show } = req.body;
  const userId = req.user.id;

  // Validate request body
  if (!question || !answerType || !options || !Array.isArray(options)) {
    return res.status(400).json({ 
      error: 'Missing required fields: question, answerType, and options array are required' 
    });
  }

  if (!['SINGLE', 'MULTI'].includes(answerType)) {
    return res.status(400).json({ error: 'answerType must be either SINGLE or MULTI' });
  }

  try {
    // Check if session exists
    const session = await findSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const poll = await createPoll({
      question,
      passCode,
      pollsLimit,
      answerType,
      show: show || false,
      sessionId: parseInt(sessionId),
      options: options.map(option => ({ text: option }))
    });

    // Emit poll created event
    emitPollCreated(sessionId, poll);

    res.status(201).json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
};

exports.updatePoll = async (req, res) => {
  const { pollId } = req.params;
  const { question, passCode, pollsLimit, answerType, options, show } = req.body;

  try {
    const existingPoll = await findPollById(pollId);
    if (!existingPoll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    const updatedPoll = await updatePoll(pollId, {
      question,
      passCode,
      pollsLimit,
      answerType,
      show,
      options
    });

    // Emit poll updated event
    emitPollUpdated(existingPoll.sessionId, updatedPoll);

    res.json(updatedPoll);
  } catch (error) {
    console.error('Error updating poll:', error);
    res.status(500).json({ error: 'Failed to update poll' });
  }
};

exports.getSessionPolls = async (req, res) => {
  const { sessionId, eventId } = req.query;

  // Validate that at least one parameter is provided
  if (!sessionId && !eventId) {
    return res.status(400).json({ 
      error: 'Either sessionId or eventId query parameter is required' 
    });
  }

  try {
    let polls;
    
    if (eventId) {
      // Get all polls for an event
      polls = await findPollsByEventId(eventId);
    } else {
      // Get polls for a specific session
      const session = await findSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      polls = await findPollsBySessionId(sessionId);
    }

    res.json({
      success: true,
      data: polls,
      count: polls.length
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ 
      error: 'Failed to fetch polls',
      details: error.message 
    });
  }
};

exports.submitPollResponse = async (req, res) => {
  const { pollId } = req.params;
  const { selectedOptions } = req.body;
  const userId = req.user.id;

  try {
    const poll = await findPollById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Validate selected options based on answer type
    if (poll.answerType === 'SINGLE' && selectedOptions.length > 1) {
      return res.status(400).json({ error: 'Single answer poll can only have one selection' });
    }

    // Add responses for each selected option
    const responses = await Promise.all(
      selectedOptions.map(optionId => 
        addPollResponse(pollId, userId, optionId)
      )
    );

    // Get updated poll results
    const results = await getPollResults(pollId);

    // Emit poll response with results
    emitPollResponse(poll.sessionId, pollId, {
      userId,
      selectedOptions,
      results,
      responses: responses.map(response => ({
        userId: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        optionId: response.optionId,
        optionText: response.option.text,
        respondedAt: response.createdAt
      }))
    });

    res.json({ 
      success: true, 
      results,
      responses: responses.map(response => ({
        userId: response.user.id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        optionId: response.optionId,
        optionText: response.option.text,
        respondedAt: response.createdAt
      }))
    });
  } catch (error) {
    console.error('Error submitting poll response:', error);
    if (error.message === 'User has already responded to this option') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to submit poll response' });
  }
};



// exports.getActivePolls = async (req, res) => {
//   const { sessionId } = req.params;

//   try {
//     const polls = await getActivePolls(sessionId);
//     res.json(polls);
//   } catch (error) {
//     console.error('Error fetching active polls:', error);
//     res.status(500).json({ error: 'Failed to fetch active polls' });
//   }
// };

// exports.getPollResults = async (req, res) => {
//   const { pollId } = req.params;

//   try {
//     const poll = await findPollById(pollId);
//     if (!poll) {
//       return res.status(404).json({ error: 'Poll not found' });
//     }

//     const results = await getPollResults(pollId);
//     res.json(results);
//   } catch (error) {
//     console.error('Error fetching poll results:', error);
//     res.status(500).json({ error: 'Failed to fetch poll results' });
//   }
// }; 