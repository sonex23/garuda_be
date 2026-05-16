import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { exportTopupsCsv, getTopups, patchTopupReview } from './admin-topups.controller.js';

export const adminTopupsRouter = Router();

adminTopupsRouter.use(requireAdmin);
adminTopupsRouter.get('/export', exportTopupsCsv);
adminTopupsRouter.get('/', getTopups);
adminTopupsRouter.patch('/:transactionId/review', patchTopupReview);