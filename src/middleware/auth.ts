
import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './error-handler.js';

export type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
};

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError('Token akses tidak ditemukan', 401));
    return;
  }

  try {
    const token = header.replace('Bearer ', '');
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('Token tidak valid atau sudah kedaluwarsa', 401));
  }
}

export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  requireAuth(req, _res, (err?: unknown) => {
    if (err) {
      next(err as never);
      return;
    }
    if (req.user?.role !== 'ADMIN') {
      next(new AppError('Akses admin diperlukan', 403));
      return;
    }
    next();
  });
}
