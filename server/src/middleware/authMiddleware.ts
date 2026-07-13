import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    logger('Invalid token', 'warn');
    res.status(401).json({ error: 'Invalid token' });
  }
}
