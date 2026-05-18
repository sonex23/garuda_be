
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth.js';
import { supportReplySchema } from './admin-support.schemas.js';
import { getSupportThread, listSupportThreads, replySupportThread } from './admin-support.service.js';

export async function getSupportThreads(_req: AuthenticatedRequest, res: Response) {
  const result = await listSupportThreads();
  res.json({ items: result });
}

export async function getSupportThreadByUser(req: AuthenticatedRequest, res: Response) {
  const result = await getSupportThread(req.params.userId as string);
  res.json(result);
}

export async function postSupportReply(req: AuthenticatedRequest, res: Response) {
  const payload = supportReplySchema.parse(req.body);
  const result = await replySupportThread(req.user!.userId, req.params.userId as string, payload.message);
  res.status(201).json(result);
}
