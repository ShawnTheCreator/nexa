import express from 'express';
import { moderateText } from '../controllers/moderationController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/moderation/text
router.post('/text', protectRoute, moderateText);

export default router;
