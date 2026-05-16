import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { exportTransactionsCsv, getTransactions, patchAssetTransactionOutcome } from './admin-transactions.controller.js';

export const adminTransactionsRouter = Router();

adminTransactionsRouter.use(requireAdmin);
adminTransactionsRouter.get('/export', exportTransactionsCsv);
adminTransactionsRouter.get('/', getTransactions);
adminTransactionsRouter.patch('/:transactionId/asset-outcome', patchAssetTransactionOutcome);
