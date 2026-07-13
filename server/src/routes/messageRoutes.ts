import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkParticipant } from '../middleware/checkParticipantMiddleware';
import { ownerMiddleware } from '../middleware/ownerMiddleware';
import * as messageController from '../controllers/messageController';

const router = Router();

router.use(authMiddleware);
router.get('/:chatId/messages', checkParticipant, messageController.getMessages);
router.post('/:chatId/messages', checkParticipant, messageController.createMessage);
router.patch('/:chatId/messages/:messageId', checkParticipant, ownerMiddleware, messageController.updateMessage);
router.get('/:chatId/messages/search', checkParticipant, messageController.searchMessages);
router.delete('/:chatId/messages/:messageId', checkParticipant, ownerMiddleware, messageController.removeMessage);

export default router;
