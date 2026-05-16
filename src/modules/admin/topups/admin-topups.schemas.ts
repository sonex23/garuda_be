
import { z } from 'zod';

export const reviewTopupSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(300).optional()
});
