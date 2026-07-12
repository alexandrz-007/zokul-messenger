import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as pushController from '../controllers/pushController';

const router = Router();

router.get('/vapid-key', pushController.getVapidKey);
router.post('/subscribe', authMiddleware, pushController.subscribe);
router.post('/unsubscribe', authMiddleware, pushController.unsubscribe);

export default router;
