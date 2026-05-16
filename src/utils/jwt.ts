
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type TokenPayload = {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.accessSecret, { expiresIn: env.accessExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.refreshSecret) as TokenPayload;
}
