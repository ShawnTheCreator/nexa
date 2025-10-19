import express from 'express';
import { handleAssistant } from '../controllers/assistantController.js';

const router = express.Router();

router.post('/', handleAssistant);

export default router;
