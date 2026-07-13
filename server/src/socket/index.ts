import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../services/authService';
import * as messageService from '../services/messageService';
import * as chatService from '../services/chatService';
import * as chatModel from '../models/Chat';
import * as UserModel from '../models/User';
import * as presenceService from '../services/presenceService';
import { logger } from '../utils/logger';
import { config } from '../config/app';

const HEARTBEAT_TIMEOUT = 35000;
const userSockets = new Map<string, Set<string>>();

interface AuthSocket extends Socket {
  userId: string;
  userName: string;
}

export function setupSocket(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin, credentials: true },
    pingTimeout: HEARTBEAT_TIMEOUT,
  });

  io.use(async (socket: Socket, next) => {
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
      (socket as AuthSocket).userId = decoded.userId;
      (socket as AuthSocket).userName = user.name;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const authSocket = socket as AuthSocket;
    const userId = authSocket.userId;
    const userName = authSocket.userName;
    logger(`Socket connected: user ${userId}`);

    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    try {
      await presenceService.setOnline(userId);
      socket.broadcast.emit('presence:update', { userId, status: 'online' });
    } catch (err) {
      logger(`Failed to set online presence for user ${userId}: ${err}`, 'error');
    }

    try {
      const onlineIds = await presenceService.getAllOnlineUserIds();
      for (const id of onlineIds) {
        if (id !== userId) {
          socket.emit('presence:update', { userId: id, status: 'online' as const });
        }
      }
    } catch (err) {
      logger(`Failed to get online users for ${userId}: ${err}`, 'error');
    }

    try {
      const chats = await chatModel.findChatsByUserId(userId);
      for (const chat of chats) {
        socket.join(`chat:${chat.id}`);
      }
    } catch (err) {
      logger(`Failed to load chats for user ${userId}: ${err}`, 'error');
    }

    socket.on('heartbeat', async () => {
      await presenceService.setOnline(userId);
    });

    socket.on('chat:join', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      logger(`Socket ${socket.id} joined chat room ${chatId}`);
    });

    socket.on('message:send', async (data: { chatId: string; text?: string; imageUrl?: string; imageUrls?: string[]; voiceUrl?: string; voiceDuration?: number; replyToId?: string }) => {
      try {
        const chat = await chatModel.findChatById(data.chatId);
        if (!chat || !chat.participantIds.includes(userId)) {
          socket.emit('error', { message: 'Forbidden' });
          return;
        }
        socket.join(`chat:${data.chatId}`);
        const message = await messageService.createMessage(
          data.chatId,
          userId,
          data.text,
          data.imageUrl,
          data.voiceUrl,
          data.voiceDuration,
          data.replyToId,
          data.imageUrls
        );
        socket.to(`chat:${data.chatId}`).emit('message:new', message);
        socket.emit('message:new', message);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('message:edit', async (data: { messageId: string; text: string; chatId: string }) => {
      try {
        const chat = await chatModel.findChatById(data.chatId);
        if (!chat || !chat.participantIds.includes(userId)) {
          socket.emit('error', { message: 'Forbidden' });
          return;
        }
        const message = await messageService.editMessage(data.messageId, data.text, userId);
        socket.to(`chat:${data.chatId}`).emit('message:edited', message);
        socket.emit('message:edited', message);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('message:delete', async (data: { messageId: string; chatId: string }) => {
      try {
        const chat = await chatModel.findChatById(data.chatId);
        if (!chat || !chat.participantIds.includes(userId)) {
          socket.emit('error', { message: 'Forbidden' });
          return;
        }
        await messageService.deleteMessage(data.messageId, userId);
        socket.to(`chat:${data.chatId}`).emit('message:deleted', { messageId: data.messageId, chatId: data.chatId });
        socket.emit('message:deleted', { messageId: data.messageId, chatId: data.chatId });
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

    socket.on('chat:created', async (data: { chatId: string; participantIds: string[] }) => {
      socket.join(`chat:${data.chatId}`);
      for (const pid of data.participantIds) {
        if (pid === userId) continue;
        const sockets = userSockets.get(pid);
        if (!sockets) continue;
        for (const sid of sockets) {
          const s = io.sockets.sockets.get(sid);
          if (s) {
            s.join(`chat:${data.chatId}`);
            s.emit('chat:new-room', { chatId: data.chatId });
          }
        }
      }
    });

    socket.on('chat:delete', async (data: { chatId: string }) => {
      try {
        await chatService.deleteChat(data.chatId, userId);
        socket.to(`chat:${data.chatId}`).emit('chat:deleted', { chatId: data.chatId });
        socket.emit('chat:deleted', { chatId: data.chatId });
        socket.leave(`chat:${data.chatId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', async () => {
      logger(`Socket disconnected: user ${userId}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
      await presenceService.setOffline(userId);
      socket.broadcast.emit('presence:update', { userId, status: 'offline' });
    });
  });

  return io;
}
