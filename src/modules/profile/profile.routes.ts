import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  changePassword,
  getMyNotificationSettings,
  me,
  updateMe,
  updateMyNotificationSettings
} from './profile.controller.js';

export const profileRouter = Router();

profileRouter.use(requireAuth);
profileRouter.get('/me', me);
profileRouter.patch('/me', updateMe);
profileRouter.patch('/me/password', changePassword);
profileRouter.get('/me/notification-settings', getMyNotificationSettings);
profileRouter.patch('/me/notification-settings', updateMyNotificationSettings);
