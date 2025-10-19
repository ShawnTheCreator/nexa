import express from 'express';
import { rateIdea, getIdeaRating } from '../controllers/ratingControllers.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:ideaId/rate', protectRoute, rateIdea);
router.get('/:ideaId', getIdeaRating);

export default router;
