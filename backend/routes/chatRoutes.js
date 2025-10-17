import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { listConversations, getConversation, sendMessage, markConversationRead } from '../controllers/messageControllers.js';

const router = express.Router();

router.get('/conversations', protectRoute, listConversations);
router.get('/conversations/:partnerId', protectRoute, getConversation);
router.post('/messages', protectRoute, sendMessage);
router.post('/conversations/:partnerId/read', protectRoute, markConversationRead);

export default router;