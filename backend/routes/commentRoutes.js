import express from 'express';
import { createComment, listComments } from '../controllers/commentControllers.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// POST /api/ideas/:ideaId/comments  (create comment)
router.post('/:ideaId/comments', protectRoute, createComment);
// GET /api/ideas/:ideaId/comments
router.get('/:ideaId/comments', listComments);

export default router;
