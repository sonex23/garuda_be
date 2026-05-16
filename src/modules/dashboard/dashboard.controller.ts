import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { getDashboardSummary } from './dashboard.service.js';

export async function summary(req: AuthenticatedRequest, res: Response) {
  const result = await getDashboardSummary(req.user!.userId);
  res.json(result);
}
