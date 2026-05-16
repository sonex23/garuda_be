import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { createCsv } from '../../../utils/csv.js';
import { parsePaginationParams } from '../../../utils/pagination.js';
import { exportAuditLogs, listAuditLogs } from './admin-audit.service.js';

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const action = typeof req.query.action === 'string' ? req.query.action : undefined;
  const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const { page, pageSize } = parsePaginationParams(req.query as Record<string, unknown>);
  const result = await listAuditLogs({ search, action, entityType, fromDate, toDate, page, pageSize });
  res.json(result);
}

export async function exportAuditLogsCsv(req: AuthenticatedRequest, res: Response) {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const action = typeof req.query.action === 'string' ? req.query.action : undefined;
  const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;
  const fromDate = typeof req.query.fromDate === 'string' ? req.query.fromDate : undefined;
  const toDate = typeof req.query.toDate === 'string' ? req.query.toDate : undefined;
  const rows = await exportAuditLogs({ search, action, entityType, fromDate, toDate });
  const csv = createCsv(['id', 'adminName', 'adminEmail', 'action', 'entityType', 'entityId', 'message', 'createdAt'], rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-logs-export.csv"');
  res.send(csv);
}