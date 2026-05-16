
import { z } from 'zod';

export const userVerificationSchema = z.object({
  isVerified: z.boolean()
});
