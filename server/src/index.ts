import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { config } from './config/app';
import { migrate } from './config/db';
import * as UserModel from './models/User';
import { logger } from './utils/logger';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import groupRoutes from './routes/groupRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';
import pushRoutes from './routes/pushRoutes';
import { uploadMiddleware } from './middleware/uploadMiddleware';
import { processImage, processAvatar } from './middleware/processImage';
import { authMiddleware, AuthRequest } from './middleware/authMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { uploadLimiter } from './middleware/rateLimit';
import { startCleanupScheduler, stopCleanupScheduler } from './services/cleanupService';
import { setupSocket } from './socket';
import { closeRedis } from './config/redis';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', requestId);
  (req as any).requestId = requestId;
  next();
});
app.use(helmet());
app.use(compression());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  const error = err as { type?: string; message?: string; status?: number };
  if (error.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }
  next(err);
});
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chats', groupRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/chats', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/push', pushRoutes);

app.post('/api/upload', uploadLimiter, authMiddleware, (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    await processImage(req, res, (processErr) => {
      if (processErr) {
        return next(processErr);
      }
      const processed = req.file!;
      res.json({ url: `/uploads/${processed.filename}` });
    });
  });
});

app.post('/api/upload/avatar', authMiddleware, (req: AuthRequest, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    await processAvatar(req, res, async (processErr) => {
      if (processErr) return next(processErr);
      const url = `/uploads/${req.file!.filename}`;
      await UserModel.updateProfile(req.userId!, { avatarUrl: url });
      res.json({ url });
    });
  });
});

app.use(errorMiddleware);

const io = setupSocket(httpServer);

async function start(): Promise<void> {
  try {
    fs.mkdirSync(config.uploadDir, { recursive: true });
    await migrate();
    startCleanupScheduler();
    httpServer.listen(config.port, () => {
      logger(`Server running on port ${config.port}`);
    });
  } catch (err: unknown) {
    logger(`Failed to start server: ${err instanceof Error ? err.message : String(err)}`, 'error');
    process.exit(1);
  }
}

start();

function gracefulShutdown(signal: string): void {
  logger(`Received ${signal}, shutting down gracefully...`);
  stopCleanupScheduler();
  httpServer.close(() => {
    logger('HTTP server closed');
    closeRedis().then(() => {
      logger('Redis connection closed');
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, httpServer, io };
