import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as messageService from '../services/messageService';

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await messageService.getMessages(chatId, offset, limit);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function createMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const { text, imageUrl } = req.body;
    const message = await messageService.createMessage(chatId, req.userId!, text, imageUrl);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}
