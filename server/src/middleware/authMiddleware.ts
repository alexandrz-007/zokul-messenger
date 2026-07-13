import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { getTokenVersion } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const decoded = verifyToken(token);
    try {
      const version = await getTokenVersion(decoded.userId);
      if (decoded.tokenVersion !== undefined && decoded.tokenVersion < version) {
        logger(`Token revoked for user ${decoded.userId}`, 'warn');
        res.status(401).json({ error: 'Token revoked' });
        return;
      }
    } catch {
      logger(`Failed to check token version for ${decoded.userId}`, 'warn');
    }
    req.userId = decoded.userId;
    next();
  } catch {
    logger('Invalid token', 'warn');
    res.status(401).json({ error: 'Invalid token' });
  }
}
