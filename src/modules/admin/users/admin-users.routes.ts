import { Router } from 'express';
import { requireAdmin } from '../../../middleware/auth.js';
import { exportUsersCsv, getUserById, getUsers, patchUserVerification } from './admin-users.controller.js';

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAdmin);
adminUsersRouter.get('/export', exportUsersCsv);
adminUsersRouter.get('/', getUsers);
adminUsersRouter.get('/:userId', getUserById);
adminUsersRouter.patch('/:userId/verification', patchUserVerification);