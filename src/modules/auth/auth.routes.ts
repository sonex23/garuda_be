
import { Router } from 'express';
import { adminLogin, login, logout, refresh, register } from './auth.controller.js';

export const authRouter = Router();
export const adminAuthRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);

adminAuthRouter.post('/login', adminLogin);
adminAuthRouter.post('/refresh', refresh);
adminAuthRouter.post('/logout', logout);
