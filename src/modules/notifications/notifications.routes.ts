import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { list, readAll, readOne } from './notifications.controller.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get('/', list);
notificationsRouter.patch('/read-all', readAll);
notificationsRouter.patch('/:id/read', readOne);
