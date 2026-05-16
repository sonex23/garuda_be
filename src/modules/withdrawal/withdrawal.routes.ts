import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { create } from './withdrawal.controller.js';

export const withdrawalRouter = Router();

withdrawalRouter.use(requireAuth);
withdrawalRouter.post('/', create);
