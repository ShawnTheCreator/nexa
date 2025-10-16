const express = require('express');
const { protectRoute } = require('../middleware/authMiddleware');
const messageControllers = require('../controllers/messageControllers');

const router = express.Router();

router.get('/conversations', protectRoute, messageControllers.listConversations);
router.get('/conversations/:partnerId', protectRoute, messageControllers.getConversation);
router.post('/messages', protectRoute, messageControllers.sendMessage);
router.post('/conversations/:partnerId/read', protectRoute, messageControllers.markConversationRead);

module.exports = router;