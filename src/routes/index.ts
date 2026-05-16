
import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js';
import { notificationsRouter } from '../modules/notifications/notifications.routes.js';
import { portfolioRouter } from '../modules/portfolio/portfolio.routes.js';
import { profileRouter } from '../modules/profile/profile.routes.js';
import { supportRouter } from '../modules/support/support.routes.js';
import { topupRouter } from '../modules/topup/topup.routes.js';
import { transactionsRouter } from '../modules/transactions/transactions.routes.js';
import { withdrawalRouter } from '../modules/withdrawal/withdrawal.routes.js';
import { adminRouter } from './admin.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/portfolio', portfolioRouter);
apiRouter.use('/topups', topupRouter);
apiRouter.use('/withdrawals', withdrawalRouter);
apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/support', supportRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/', profileRouter);
