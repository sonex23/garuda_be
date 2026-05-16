import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { createCsv } from '../../../utils/csv.js';
import { parsePaginationParams } from '../../../utils/pagination.js';
import { reviewWithdrawalSchema } from './admin-withdrawals.schemas.js';
import { exportWithdrawals, listWithdrawals, reviewWithdrawal } from './admin-withdrawals.service.js';

export async function getWithdrawals(req: AuthenticatedRequest, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const { page, pageSize } = parsePaginationParams(req.query as Record<string, unknown>);
  const result = await listWithdrawals({ status, search, fromDate, toDate, page, pageSize });
  res.json(result);
}

export async function exportWithdrawalsCsv(req: AuthenticatedRequest, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const rows = await exportWithdrawals({ status, search, fromDate, toDate });
  const csv = createCsv(['id', 'userName', 'userEmail', 'amount', 'fee', 'destinationType', 'destinationName', 'accountNumber', 'accountName', 'status', 'reviewedAt', 'reviewNote', 'createdAt'], rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="withdrawals-export.csv"');
  res.send(csv);
}

export async function patchWithdrawalReview(req: AuthenticatedRequest, res: Response) {
  const payload = reviewWithdrawalSchema.parse(req.body);
  const result = await reviewWithdrawal(req.user!.userId, req.params.transactionId, payload);
  res.json(result);
}