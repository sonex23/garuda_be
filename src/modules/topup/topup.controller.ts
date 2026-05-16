import path from 'node:path';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';
import { createTopUpSchema } from './topup.schemas.js';
import { createTopUp, uploadTopUpProof } from './topup.service.js';

export async function create(req: AuthenticatedRequest, res: Response) {
  const payload = createTopUpSchema.parse(req.body);
  const result = await createTopUp(req.user!.userId, payload);
  res.status(201).json(result);
}

export async function uploadProof(req: AuthenticatedRequest, res: Response) {
  if (!req.file) {
    throw new AppError('File bukti pembayaran wajib diupload', 400);
  }

  const imageUrl = `/uploads/${path.basename(req.file.path)}`;
  const result = await uploadTopUpProof(req.user!.userId, req.params.id, imageUrl);
  res.json(result);
}
