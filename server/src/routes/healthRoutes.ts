import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { config } from '../config/app';

const router = Router();
let startTime = Date.now();

export function resetStartTime(): void {
  startTime = Date.now();
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      db: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'error',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      db: 'disconnected',
    });
  }
});

export default router;
