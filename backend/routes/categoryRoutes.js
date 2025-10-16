import express from 'express';
import { listCategories, getCategoryById, createCategory, updateCategory, archiveCategory } from '../controllers/categoryControllers.js';
import { protectRoute, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', listCategories);
router.get('/:id', getCategoryById);

// Admin-only
router.post('/', protectRoute, requireAdmin, createCategory);
router.patch('/:id', protectRoute, requireAdmin, updateCategory);
router.delete('/:id', protectRoute, requireAdmin, archiveCategory);

export default router;