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

export async function deleteChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await chatService.deleteChat(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Chat not found') {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err.message === 'Not a participant') {
      res.status(403).json({ error: err.message });
      return;
    }
    if (err.message === 'Only the group creator can delete this chat') {
      res.status(403).json({ error: err.message });
      return;
    }
    next(err);
  }
}
