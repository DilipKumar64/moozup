const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/engage.controller');
const authenticateJWT = require('../../middlewares/auth.middleware');

// Session live status routes
router.patch('/:sessionId/live', authenticateJWT, sessionController.toggleSessionLive);

// Get sessions by date
router.get('/sessions/date', authenticateJWT, sessionController.getSessionsByDate);

// Question routes
router.post('/session/:sessionId/questions', authenticateJWT, sessionController.createQuestion);
router.patch('/question/:questionId', authenticateJWT, sessionController.updateQuestion);
router.get('/:sessionId/questions', authenticateJWT, sessionController.getSessionQuestions);

// Poll routes
router.post('/session/:sessionId/poll', authenticateJWT, sessionController.createPoll);
router.put('/poll/:pollId', authenticateJWT, sessionController.updatePoll);
router.get('/polls', authenticateJWT, sessionController.getSessionPolls);
router.post('/poll/:pollId/response', authenticateJWT, sessionController.submitPollResponse);

module.exports = router; 