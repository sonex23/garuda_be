
import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { getSupportThreadByUser, getSupportThreads, postSupportReply } from './admin-support.controller.js';

export const adminSupportRouter = Router();

adminSupportRouter.use(requireAdmin);
adminSupportRouter.get('/threads', getSupportThreads);
adminSupportRouter.get('/threads/:userId', getSupportThreadByUser);
adminSupportRouter.post('/threads/:userId/reply', postSupportReply);
