import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import * as chatModel from '../models/Chat';

export async function checkParticipant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const chatId = req.params.chatId || req.params.id;
  if (!chatId) {
    res.status(400).json({ error: 'Chat ID is required' });
    return;
  }
  const chat = await chatModel.findChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: 'Chat not found' });
    return;
  }
  if (!chat.participantIds.includes(req.userId!)) {
    res.status(403).json({ error: 'You are not a participant of this chat' });
    return;
  }
  next();
}
