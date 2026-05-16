import { z } from 'zod';

export const transactionQuerySchema = z.object({
  type: z.enum(['all', 'topup', 'buy', 'sell', 'withdrawal']).default('all')
});
