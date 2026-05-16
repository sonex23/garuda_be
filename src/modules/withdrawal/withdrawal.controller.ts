import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { createWithdrawalSchema } from './withdrawal.schemas.js';
import { createWithdrawal } from './withdrawal.service.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const payload = createWithdrawalSchema.parse(req.body);
  const result = await createWithdrawal(req.user!.userId, payload);
  res.status(201).json(result);
}
