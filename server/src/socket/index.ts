import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../services/authService';
import * as messageService from '../services/messageService';
import * as chatModel from '../models/Chat';
import * as UserModel from '../models/User';
import * as presenceService from '../services/presenceService';
import { logger } from '../utils/logger';
import { config } from '../config/app';

const HEARTBEAT_TIMEOUT = 35000;

export function setupSocket(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin, credentials: true },
    pingTimeout: HEARTBEAT_TIMEOUT,
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }
      (socket as any).userId = decoded.userId;
      (socket as any).userName = user.name;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    const userName = (socket as any).userName;
    logger(`Socket connected: user ${userId}`);

    await presenceService.setOnline(userId);
    socket.broadcast.emit('presence:update', { userId, status: 'online' });

    const onlineIds = await presenceService.getAllOnlineUserIds();
    for (const id of onlineIds) {
      if (id !== userId) {
        socket.emit('presence:update', { userId: id, status: 'online' as const });
      }
    }

    const chats = await chatModel.findChatsByUserId(userId);
    for (const chat of chats) {
      socket.join(`chat:${chat.id}`);
    }

    socket.on('heartbeat', async () => {
      await presenceService.setOnline(userId);
    });

    socket.on('message:send', async (data: { chatId: string; text?: string; imageUrl?: string }) => {
      try {
        const message = await messageService.createMessage(
          data.chatId,
          userId,
          data.text,
          data.imageUrl
        );
        socket.to(`chat:${data.chatId}`).emit('message:new', message);
        socket.emit('message:new', message);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('message:typing', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:start', {
        chatId: data.chatId,
        userId,
        userName,
      });
    });

    socket.on('disconnect', async () => {
      logger(`Socket disconnected: user ${userId}`);
      await presenceService.setOffline(userId);
      socket.broadcast.emit('presence:update', { userId, status: 'offline' });
    });
  });

  return io;
}
