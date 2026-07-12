import * as ChatModel from '../models/Chat';
import { ChatWithUsers } from '../types';
import { logger } from '../utils/logger';

export async function getUserChats(userId: string): Promise<ChatWithUsers[]> {
  return ChatModel.findChatsByUserId(userId);
}

export async function createChat(userId: string, participantId: string): Promise<ChatWithUsers> {
  if (userId === participantId) {
    throw new Error('Cannot create chat with yourself');
  }
  const existing = await ChatModel.findExistingChat(userId, participantId);
  if (existing) {
    return existing;
  }
  const chat = await ChatModel.createChat(userId, participantId);
  logger(`Chat created: ${chat.id}`);
  return chat;
}

export async function getChatById(chatId: string): Promise<ChatWithUsers | null> {
  return ChatModel.findChatById(chatId);
}
