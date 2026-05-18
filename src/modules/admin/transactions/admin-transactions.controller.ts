import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { createCsv } from '../../../utils/csv.js';
import { parsePaginationParams } from '../../../utils/pagination.js';
import { assetOutcomeSchema } from './admin-transactions.schemas.js';
import { exportTransactions, listTransactions, setAssetTransactionOutcome } from './admin-transactions.service.js';

export async function getTransactions(req: AuthenticatedRequest, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const type = typeof req.query.type === 'string' ? req.query.type : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const { page, pageSize } = parsePaginationParams(req.query as Record<string, unknown>);
  const result = await listTransactions({ search, type, status, fromDate, toDate, page, pageSize });
  res.json(result);
}

export async function exportTransactionsCsv(req: AuthenticatedRequest, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const type = typeof req.query.type === 'string' ? req.query.type : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const rows = await exportTransactions({ search, type, status, fromDate, toDate });
  const csv = createCsv(['id', 'userName', 'userEmail', 'title', 'type', 'amount', 'fee', 'status', 'assetSymbol', 'assetName', 'outcomeType', 'outcomePercentage', 'outcomeAmount', 'outcomeNote', 'outcomeSettledAt', 'createdAt'], rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions-export.csv"');
  res.send(csv);
}

export async function patchAssetTransactionOutcome(req: AuthenticatedRequest, res: Response) {
  const payload = assetOutcomeSchema.parse(req.body);
  const result = await setAssetTransactionOutcome(req.user!.userId, req.params.transactionId as string, payload);
  res.json(result);
}
