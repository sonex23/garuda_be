import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { markAllNotificationsAsRead, markNotificationAsRead, getNotifications } from './notifications.service.js';

export async function list(req: AuthenticatedRequest, res: Response) {
  const result = await getNotifications(req.user!.userId);
  res.json(result);
}

export async function readOne(req: AuthenticatedRequest, res: Response) {
  await markNotificationAsRead(req.user!.userId, req.params.id);
  res.json({ message: 'Notifikasi ditandai sudah dibaca' });
}

export async function readAll(req: AuthenticatedRequest, res: Response) {
  await markAllNotificationsAsRead(req.user!.userId);
  res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
}
