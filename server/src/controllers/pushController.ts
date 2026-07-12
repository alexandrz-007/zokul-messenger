import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';
import { config } from '../config/app';

export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { subscription } = req.body;
    const userId = (req as any).userId;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    await notificationService.saveSubscription(userId, subscription);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function unsubscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { endpoint } = req.body;
    const userId = (req as any).userId;
    await notificationService.removeSubscription(userId, endpoint);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export function getVapidKey(_req: Request, res: Response) {
  res.json({ publicKey: config.vapidPublicKey });
}
