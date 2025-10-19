import express from 'express';
import { listUsers } from '../controllers/userControllers.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/users?q=search
router.get('/', protectRoute, listUsers);

export default router;
