import { z } from 'zod';

export const createTopUpSchema = z.object({
  amount: z.coerce.number().int().min(1000000),
  method: z.enum(['bank', 'ewallet'])
});
