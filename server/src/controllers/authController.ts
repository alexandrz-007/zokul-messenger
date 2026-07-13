import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as authService from '../services/authService';
import * as UserModel from '../models/User';
import { config } from '../config/app';

function cookieOptions(req: AuthRequest) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password and name are required' });
      return;
    }
    const result = await authService.register(email, password, name);
    res.cookie('token', result.token, cookieOptions(req));
    res.status(201).json({ user: result.user });
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
    res.cookie('token', result.token, cookieOptions(req));
    res.json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserModel.findById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Old password and new password are required' });
      return;
    }
    await authService.changePassword(req.userId!, oldPassword, newPassword);
    res.clearCookie('token', { path: '/' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: AuthRequest, res: Response): Promise<void> {
  res.clearCookie('token', { path: '/' });
  res.json({ ok: true });
}
