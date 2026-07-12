import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { config } from './config/app';
import { migrate } from './config/db';
import { logger } from './utils/logger';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import groupRoutes from './routes/groupRoutes';
import messageRoutes from './routes/messageRoutes';
import userRoutes from './routes/userRoutes';
import pushRoutes from './routes/pushRoutes';
import { uploadMiddleware } from './middleware/uploadMiddleware';
import { authMiddleware } from './middleware/authMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { setupSocket } from './socket';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/chats', groupRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/chats', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/push', pushRoutes);

app.post('/api/upload', authMiddleware, (req, res, next) => {
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
    await migrate();
    httpServer.listen(config.port, () => {
      logger(`Server running on port ${config.port}`);
    });
  } catch (err: any) {
    logger(`Failed to start server: ${err.message}`, 'error');
    process.exit(1);
  }
}

start();

export { app, httpServer, io };
