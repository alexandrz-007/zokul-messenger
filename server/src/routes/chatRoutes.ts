import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkParticipant } from '../middleware/checkParticipantMiddleware';
import * as chatController from '../controllers/chatController';

const router = Router();

router.use(authMiddleware);
router.get('/', chatController.getChats);
router.get('/:id', checkParticipant, chatController.getChatById);
router.post('/', chatController.createChat);

export default router;
