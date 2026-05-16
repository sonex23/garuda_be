import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { exportAuditLogsCsv, getAuditLogs } from './admin-audit.controller.js';

export const adminAuditRouter = Router();

adminAuditRouter.use(requireAdmin);
adminAuditRouter.get('/export', exportAuditLogsCsv);
adminAuditRouter.get('/', getAuditLogs);