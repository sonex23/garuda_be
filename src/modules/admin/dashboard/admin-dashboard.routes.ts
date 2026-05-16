
import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { getDashboardSummary } from './admin-dashboard.controller.js';

export const adminDashboardRouter = Router();

adminDashboardRouter.use(requireAdmin);
adminDashboardRouter.get('/summary', getDashboardSummary);
