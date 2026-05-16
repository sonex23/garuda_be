import { z } from 'zod';

export const createWithdrawalSchema = z.object({
  amount: z.coerce.number().int().min(50000),
  accountType: z.enum(['bank', 'ewallet']),
  destinationName: z.string().min(2),
  accountNumber: z.string().min(5),
  accountName: z.string().min(3)
});
