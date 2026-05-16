import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { changePasswordSchema, notificationSettingsSchema, updateProfileSchema } from './profile.schemas.js';
import {
  getCurrentUser,
  getNotificationSettings,
  updateCurrentUser,
  updateNotificationSettings,
  updatePassword
} from './profile.service.js';

export async function me(req: AuthenticatedRequest, res: Response) {
  const result = await getCurrentUser(req.user!.userId);
  res.json(result);
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  const payload = updateProfileSchema.parse(req.body);
  const result = await updateCurrentUser(req.user!.userId, payload);
  res.json(result);
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const payload = changePasswordSchema.parse(req.body);
  const result = await updatePassword(req.user!.userId, payload);
  res.json(result);
}

export async function getMyNotificationSettings(req: AuthenticatedRequest, res: Response) {
  const result = await getNotificationSettings(req.user!.userId);
  res.json(result);
}

export async function updateMyNotificationSettings(req: AuthenticatedRequest, res: Response) {
  const payload = notificationSettingsSchema.parse(req.body);
  const result = await updateNotificationSettings(req.user!.userId, payload);
  res.json(result);
}
