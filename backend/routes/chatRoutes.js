const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Bypass DB checks in Mock Mode
// router.use(trialCheckMiddleware);
// router.use(developerBypassMiddleware);
// router.use(usageLimitMiddleware);

// Send Chat Message
router.post('/send', chatController.sendMessage);

// Get Conversation
router.get('/:conversationId', chatController.getConversation);

// Get User Conversations
router.get('/', chatController.getUserConversations);

// Delete Conversation
router.delete('/:conversationId', chatController.deleteConversation);

module.exports = router;
