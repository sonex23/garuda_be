
import type { Request, Response } from 'express';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import { loginAdmin, loginUser, logoutUser, refreshAccessToken, registerUser } from './auth.service.js';

export async function register(req: Request, res: Response) {
  const payload = registerSchema.parse(req.body);
  const result = await registerUser(payload);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const result = await loginUser(payload);
  res.json(result);
}

export async function adminLogin(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const result = await loginAdmin(payload);
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const payload = refreshSchema.parse(req.body);
  const result = await refreshAccessToken(payload.refreshToken);
  res.json(result);
}

export async function logout(req: Request, res: Response) {
  const payload = refreshSchema.parse(req.body);
  const result = await logoutUser(payload.refreshToken);
  res.json(result);
}
