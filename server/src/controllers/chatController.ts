import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as chatService from '../services/chatService';

export async function getChats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const chats = await chatService.getUserChats(req.userId!);
    res.json(chats);
  } catch (err) {
    next(err);
  }
}

export async function getChatById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const chat = await chatService.getChatById(req.params.id);
    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }
    res.json(chat);
  } catch (err) {
    next(err);
  }
}

export async function createChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      res.status(400).json({ error: 'participantId is required' });
      return;
    }
    const chat = await chatService.createChat(req.userId!, participantId);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
}
