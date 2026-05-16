import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { createInvestmentSchema, sellHoldingSchema } from './portfolio.schemas.js';
import { createInvestment, getPortfolio, sellHolding } from './portfolio.service.js';

export async function listPortfolio(req: AuthenticatedRequest, res: Response) {
  const result = await getPortfolio(req.user!.userId);
  res.json(result);
}

export async function invest(req: AuthenticatedRequest, res: Response) {
  const payload = createInvestmentSchema.parse(req.body);
  const result = await createInvestment(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function sell(req: AuthenticatedRequest, res: Response) {
  const payload = sellHoldingSchema.parse(req.body ?? {});
  const result = await sellHolding(req.user!.userId, req.params.holdingId, payload);
  res.json(result);
}
