const express = require('express');
const multer = require('multer');
const { protectRoute, requireAdmin } = require('../middleware/authMiddleware');
const {
  createIdea,
  uploadIdeaAttachments,
  uploadIdeaVideo,
  listIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
} = require('../controllers/ideaControllers');

const router = express.Router();

// Use memory storage for direct upload to Azure
const upload = multer({ storage: multer.memoryStorage() });

// Public listing (could be restricted later)
router.get('/', listIdeas);
router.get('/:id', getIdeaById);

// Authenticated idea creation and media upload
router.post('/', protectRoute, createIdea);
router.post('/:id/attachments', protectRoute, upload.array('attachments', 5), uploadIdeaAttachments);
router.post('/:id/video', protectRoute, upload.single('video'), uploadIdeaVideo);

// Admin-only updates and deletes
router.patch('/:id', protectRoute, requireAdmin, updateIdea);
router.delete('/:id', protectRoute, requireAdmin, deleteIdea);

module.exports = router;