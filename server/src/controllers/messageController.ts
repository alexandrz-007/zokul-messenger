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
    const { text, imageUrl, imageUrls, voiceUrl, voiceDuration, replyToId } = req.body;
    const message = await messageService.createMessage(chatId, req.userId!, text, imageUrl, voiceUrl, voiceDuration, replyToId, imageUrls);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

export async function updateMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const message = await messageService.editMessage(messageId, text, req.userId!);
    res.json(message);
  } catch (err) {
    next(err);
  }
}

export async function removeMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messageId } = req.params;
    const { chatId } = await messageService.deleteMessage(messageId, req.userId!);
    res.json({ chatId, messageId });
  } catch (err) {
    next(err);
  }
}
