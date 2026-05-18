import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { createCsv } from '../../../utils/csv.js';
import { parsePaginationParams } from '../../../utils/pagination.js';
import { reviewTopupSchema } from './admin-topups.schemas.js';
import { exportTopups, listTopups, reviewTopup } from './admin-topups.service.js';

export async function getTopups(req: AuthenticatedRequest, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const { page, pageSize } = parsePaginationParams(req.query as Record<string, unknown>);
  const result = await listTopups({ status, search, fromDate, toDate, page, pageSize });
  res.json(result);
}

export async function exportTopupsCsv(req: AuthenticatedRequest, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const rows = await exportTopups({ status, search, fromDate, toDate });
  const csv = createCsv(['id', 'userName', 'userEmail', 'amount', 'fee', 'total', 'method', 'proofImageUrl', 'status', 'reviewedAt', 'reviewNote', 'createdAt'], rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="topups-export.csv"');
  res.send(csv);
}

export async function patchTopupReview(req: AuthenticatedRequest, res: Response) {
  const payload = reviewTopupSchema.parse(req.body);
  const result = await reviewTopup(req.user!.userId, req.params.transactionId  as string, payload);
  res.json(result);
}