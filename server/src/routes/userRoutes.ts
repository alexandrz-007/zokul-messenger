import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

const router = Router();

router.use(authMiddleware);
router.get('/search', userController.search);
router.get('/:id/online', userController.getOnline);
router.get('/:id', userController.getById);

export default router;
