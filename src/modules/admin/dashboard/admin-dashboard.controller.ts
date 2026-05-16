
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { getAdminDashboardSummary } from './admin-dashboard.service.js';

export async function getDashboardSummary(_req: AuthenticatedRequest, res: Response) {
  const result = await getAdminDashboardSummary();
  res.json(result);
}
