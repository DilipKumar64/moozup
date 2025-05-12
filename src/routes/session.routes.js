const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const authenticateJWT = require('../middlewares/auth.middleware');

// Session live status routes
router.patch('/:sessionId/live', authenticateJWT, sessionController.toggleSessionLive);

// Question routes
router.post('/:sessionId/questions', authenticateJWT, sessionController.createQuestion);
router.patch('/questions/:questionId', authenticateJWT, sessionController.updateQuestion);
router.get('/:sessionId/questions', authenticateJWT, sessionController.getSessionQuestions);

module.exports = router; 