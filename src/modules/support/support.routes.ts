import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { chatHistory, faqs, info, sendMessage, winners } from './support.controller.js';

export const supportRouter = Router();

supportRouter.get('/faqs', faqs);
supportRouter.get('/info', info);
supportRouter.get('/winners', winners);
supportRouter.use(requireAuth);
supportRouter.get('/chats', chatHistory);
supportRouter.post('/chats', sendMessage);
