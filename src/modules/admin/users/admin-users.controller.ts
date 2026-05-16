import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { createCsv } from '../../../utils/csv.js';
import { parsePaginationParams } from '../../../utils/pagination.js';
import { userVerificationSchema } from './admin-users.schemas.js';
import { exportUsers, getUserDetail, listUsers, updateUserVerification } from './admin-users.service.js';

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const verification = typeof req.query.verification === 'string' ? req.query.verification : undefined;
  const { page, pageSize } = parsePaginationParams(req.query as Record<string, unknown>);
  const result = await listUsers({ search, verification, page, pageSize });
  res.json(result);
}

export async function exportUsersCsv(req: AuthenticatedRequest, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const verification = typeof req.query.verification === 'string' ? req.query.verification : undefined;
  const rows = await exportUsers({ search, verification });
  const csv = createCsv(['id', 'fullName', 'email', 'phone', 'membershipTier', 'isVerified', 'availableBalance', 'totalInvested', 'totalProfit', 'transactionCount', 'createdAt'], rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
  res.send(csv);
}

export async function getUserById(req: AuthenticatedRequest, res: Response) {
  const result = await getUserDetail(req.params.userId);
  res.json(result);
}

export async function patchUserVerification(req: AuthenticatedRequest, res: Response) {
  const payload = userVerificationSchema.parse(req.body);
  const result = await updateUserVerification(req.user!.userId, req.params.userId, payload.isVerified);
  res.json(result);
}