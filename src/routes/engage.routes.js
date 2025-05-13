const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/engage.controller');
const authenticateJWT = require('../middlewares/auth.middleware');

// Session live status routes
router.patch('/:sessionId/live', authenticateJWT, sessionController.toggleSessionLive);

// Get sessions by date
router.get('/sessions/date', authenticateJWT, sessionController.getSessionsByDate);

// Question routes
router.post('/session/:sessionId/questions', authenticateJWT, sessionController.createQuestion);
router.patch('/question/:questionId', authenticateJWT, sessionController.updateQuestion);
router.get('/:sessionId/questions', authenticateJWT, sessionController.getSessionQuestions);

module.exports = router; 