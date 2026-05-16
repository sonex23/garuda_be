import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { exportWithdrawalsCsv, getWithdrawals, patchWithdrawalReview } from './admin-withdrawals.controller.js';

export const adminWithdrawalsRouter = Router();

adminWithdrawalsRouter.use(requireAdmin);
adminWithdrawalsRouter.get('/export', exportWithdrawalsCsv);
adminWithdrawalsRouter.get('/', getWithdrawals);
adminWithdrawalsRouter.patch('/:transactionId/review', patchWithdrawalReview);