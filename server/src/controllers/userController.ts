import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as UserModel from '../models/User';
import * as presenceService from '../services/presenceService';

export async function search(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string) || '';
    const users = await UserModel.search(q, req.userId!);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getOnline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const online = await presenceService.isOnline(req.params.id);
    res.json({ online });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}
