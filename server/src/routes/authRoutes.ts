import { Router } from 'express';
import * as authController from '../controllers/authController';
import { loginLimiter, registerLimiter } from '../middleware/rateLimitMiddleware';

const router = Router();

router.post('/invite', authController.invite);
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

export default router;
