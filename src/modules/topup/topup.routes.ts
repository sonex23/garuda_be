import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { create, uploadProof } from './topup.controller.js';

export const topupRouter = Router();

topupRouter.use(requireAuth);
topupRouter.post('/', create);
topupRouter.post('/:id/proof', upload.single('proof'), uploadProof);
