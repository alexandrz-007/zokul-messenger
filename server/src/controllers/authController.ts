import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as authService from '../services/authService';

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password and name are required' });
      return;
    }
    const result = await authService.register(email, password, name);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function invite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Invite code is required' });
      return;
    }
    const result = await authService.registerByInvite(code);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
