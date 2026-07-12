import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkParticipant } from '../middleware/checkParticipantMiddleware';
import * as messageController from '../controllers/messageController';

const router = Router();

router.use(authMiddleware);
router.get('/:chatId/messages', checkParticipant, messageController.getMessages);
router.post('/:chatId/messages', checkParticipant, messageController.createMessage);

export default router;
