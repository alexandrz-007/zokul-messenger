import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  const token = header.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    logger('Invalid token', 'warn');
    res.status(401).json({ error: 'Invalid token' });
  }
}
