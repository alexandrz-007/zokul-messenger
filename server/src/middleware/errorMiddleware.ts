import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger(err.message, 'error');
  if (err.message === 'Email already registered') {
    res.status(409).json({ error: err.message });
    return;
  }
  if (err.message === 'Invalid credentials') {
    res.status(401).json({ error: err.message });
    return;
  }
  if (err.message === 'Cannot create chat with yourself' || err.message === 'Message must have text, image, or voice') {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err.message === 'Only image and audio files are allowed') {
    res.status(400).json({ error: err.message });
    return;
  }
  if ((err as any).code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'File too large' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
