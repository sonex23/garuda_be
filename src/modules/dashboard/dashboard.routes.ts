import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { summary } from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);
dashboardRouter.get('/summary', summary);
