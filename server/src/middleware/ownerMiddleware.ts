import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import * as MessageModel from '../models/Message';

export async function ownerMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messageId } = req.params;
    const message = await MessageModel.findById(messageId);
    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    if (message.senderId !== req.userId) {
      res.status(403).json({ error: 'Not your message' });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
