import { z } from 'zod';

export const assetOutcomeSchema = z.object({
  outcomeType: z.enum(['profit', 'loss']),
  percentage: z.number().min(0).max(1000),
  note: z.string().max(300).optional().nullable()
});
