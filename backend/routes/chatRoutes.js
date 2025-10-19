import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middleware/authMiddleware.js';
import { listConversations, markConversationRead } from '../controllers/messageControllers.js';
import { sendMessageWithAttachment, getConversationWithAttachments } from '../controllers/messageAttachmentControllers.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/conversations', protectRoute, listConversations);
router.get('/conversations/:partnerId', protectRoute, getConversationWithAttachments);
// Accept optional files (images/audio) under field name 'files'
router.post('/messages', protectRoute, upload.array('files', 5), sendMessageWithAttachment);
router.post('/conversations/:partnerId/read', protectRoute, markConversationRead);

export default router;