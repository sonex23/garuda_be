import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { listTransactions } from './transactions.controller.js';

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);
transactionsRouter.get('/', listTransactions);
