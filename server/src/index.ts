import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { config } from './config/app';
import { migrate } from './config/db';
import { logger } from './utils/logger';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import groupRoutes from './routes/groupRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';
import pushRoutes from './routes/pushRoutes';
import { uploadMiddleware } from './middleware/uploadMiddleware';
import { authMiddleware } from './middleware/authMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { authLimiter, uploadLimiter } from './middleware/rateLimit';
import { startCleanupScheduler, stopCleanupScheduler } from './services/cleanupService';
import { setupSocket } from './socket';
import { closeRedis } from './config/redis';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use((err: any, _req: any, res: any, next: any) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
});
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chats', groupRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/chats', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/push', pushRoutes);

app.post('/api/upload', uploadLimiter, authMiddleware, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    res.json({ url: `/uploads/${file.filename}` });
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
  } catch (err: any) {
    logger(`Failed to start server: ${err.message}`, 'error');
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
