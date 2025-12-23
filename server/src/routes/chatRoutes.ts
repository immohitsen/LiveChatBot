import { Router } from 'express';
import { chat, getHistory } from '../controllers/chatController';

const router = Router();

// Ye route banega: POST /api/chat/message
router.post('/message', chat);
router.get('/history/:sessionId', getHistory);

export default router;