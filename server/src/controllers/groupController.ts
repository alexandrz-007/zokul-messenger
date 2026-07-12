import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as groupService from '../services/groupService';

export async function createGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, participantIds } = req.body;
    if (!name || !participantIds || !Array.isArray(participantIds)) {
      res.status(400).json({ error: 'name and participantIds array are required' });
      return;
    }
    const chat = await groupService.createGroup(req.userId!, name, participantIds);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    await groupService.addMember(req.params.id, userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await groupService.removeMember(req.params.id, req.params.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
