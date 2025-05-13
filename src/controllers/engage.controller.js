const { PrismaClient } = require('@prisma/client');
const { emitSessionUpdate, emitQuestionUpdate } = require('../socket');
const { findSessionById, updateSessionLiveStatus, findSessionQuestions, findSessionsByDate } = require('../models/session.model');
const { createQuestion, updateQuestion, findQuestionById } = require('../models/question.model');
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