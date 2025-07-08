const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authenticateJWT = require('../middlewares/auth.middleware');
const uploadFields = require('../middlewares/upload.middleware2');

// Get all chats for an attendee
router.get('/attendee/:attendeeId', authenticateJWT, chatController.getAttendeeChats);

// Get messages for a specific chat
router.get('/:chatId/messages', authenticateJWT, chatController.getChatMessages);

// Send a message
router.post('/send', authenticateJWT, chatController.sendMessage);

// Upload chat image
router.post('/upload-image/:chatId', authenticateJWT, uploadFields.chatImage, chatController.uploadChatImage);

// Mark messages as read
router.post('/mark-read', authenticateJWT, chatController.markMessagesAsRead);

// Get unread message count for an attendee
router.get('/attendee/:attendeeId/unread-count', authenticateJWT, chatController.getUnreadMessageCount);

// Get attendees that can be chatted with
router.get('/chattable-attendees', authenticateJWT, chatController.getChattableAttendees);

module.exports = router; 