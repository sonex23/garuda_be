
import { Router } from 'express';
import { adminAuthRouter } from '../modules/auth/auth.routes.js';
import { adminAuditRouter } from '../modules/admin/audit/admin-audit.routes.js';
import { adminContentRouter } from '../modules/admin/content/admin-content.routes.js';
import { adminDashboardRouter } from '../modules/admin/dashboard/admin-dashboard.routes.js';
import { adminSupportRouter } from '../modules/admin/support/admin-support.routes.js';
import { adminTopupsRouter } from '../modules/admin/topups/admin-topups.routes.js';
import { adminTransactionsRouter } from '../modules/admin/transactions/admin-transactions.routes.js';
import { adminUsersRouter } from '../modules/admin/users/admin-users.routes.js';
import { adminWithdrawalsRouter } from '../modules/admin/withdrawals/admin-withdrawals.routes.js';

export const adminRouter = Router();

adminRouter.use('/auth', adminAuthRouter);
adminRouter.use('/dashboard', adminDashboardRouter);
adminRouter.use('/users', adminUsersRouter);
adminRouter.use('/topups', adminTopupsRouter);
adminRouter.use('/withdrawals', adminWithdrawalsRouter);
adminRouter.use('/transactions', adminTransactionsRouter);
adminRouter.use('/support', adminSupportRouter);
adminRouter.use('/content', adminContentRouter);
adminRouter.use('/audit-logs', adminAuditRouter);
