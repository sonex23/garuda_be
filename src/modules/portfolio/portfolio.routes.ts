import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { invest, listPortfolio, sell } from './portfolio.controller.js';

export const portfolioRouter = Router();

portfolioRouter.use(requireAuth);
portfolioRouter.get('/', listPortfolio);
portfolioRouter.post('/investments', invest);
portfolioRouter.post('/holdings/:holdingId/sell', sell);
