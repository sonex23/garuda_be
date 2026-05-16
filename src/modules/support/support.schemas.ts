import { z } from 'zod';

export const createSupportMessageSchema = z.object({
  message: z.string().min(3)
});
