import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  address: z.string().min(8).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((value) => value.newPassword === value.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Konfirmasi password tidak cocok'
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  appNotifications: z.boolean(),
  smsNotifications: z.boolean()
});
