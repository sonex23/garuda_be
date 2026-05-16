
import { z } from 'zod';

export const supportReplySchema = z.object({
  message: z.string().min(1).max(1000)
});
