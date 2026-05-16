import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { createSupportMessageSchema } from './support.schemas.js';
import { createChatMessage, getChatMessages, getFaqs, getSupportInfo, getWinnerList } from './support.service.js';

export async function faqs(_req: AuthenticatedRequest, res: Response) {
  const result = await getFaqs();
  res.json(result);
}

export async function info(_req: AuthenticatedRequest, res: Response) {
  const result = await getSupportInfo();
  res.json(result);
}

export async function chatHistory(req: AuthenticatedRequest, res: Response) {
  const result = await getChatMessages(req.user!.userId);
  res.json(result);
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const payload = createSupportMessageSchema.parse(req.body);
  const result = await createChatMessage(req.user!.userId, payload.message);
  res.status(201).json(result);
}


export async function winners(_req: AuthenticatedRequest, res: Response) {
  const result = await getWinnerList();
  res.json(result);
}
