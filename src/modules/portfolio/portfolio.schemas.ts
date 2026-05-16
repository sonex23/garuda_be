import { z } from 'zod';

export const createInvestmentSchema = z.object({
  assetSymbol: z.string().min(1),
  amount: z.coerce.number().int().positive()
});

export const sellHoldingSchema = z.object({
  sellType: z.enum(['take_profit', 'stop_loss']).default('take_profit')
});
