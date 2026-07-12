import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkParticipant } from '../middleware/checkParticipantMiddleware';
import * as groupController from '../controllers/groupController';

const router = Router();

router.use(authMiddleware);
router.post('/group', groupController.createGroup);
router.post('/:id/members', checkParticipant, groupController.addMember);
router.delete('/:id/members/:userId', checkParticipant, groupController.removeMember);

export default router;
