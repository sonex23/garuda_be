import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { transactionQuerySchema } from './transactions.schemas.js';
import { getTransactions } from './transactions.service.js';

export async function listTransactions(req: AuthenticatedRequest, res: Response) {
  const query = transactionQuerySchema.parse(req.query);
  const result = await getTransactions(req.user!.userId, query.type);
  res.json(result);
}
