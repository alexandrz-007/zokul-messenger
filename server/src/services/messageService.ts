import * as MessageModel from '../models/Message';
import * as ChatModel from '../models/Chat';
import * as UserModel from '../models/User';
import { Message } from '../types';
import { logger } from '../utils/logger';
import { sendPushNotification } from './notificationService';

export async function getMessages(
  chatId: string,
  offset?: number,
  limit?: number
): Promise<Message[]> {
  return MessageModel.findByChatId(chatId, offset || 0, limit || 50);
}

export async function createMessage(
  chatId: string,
  senderId: string,
  text?: string,
  imageUrl?: string
): Promise<Message> {
  if (!text && !imageUrl) {
    throw new Error('Message must have text or image');
  }
  const message = await MessageModel.create(chatId, senderId, text, imageUrl);
  logger(`Message created in chat ${chatId}`);

  try {
    const chat = await ChatModel.findChatById(chatId);
    const sender = await UserModel.findById(senderId);
    if (chat && sender) {
      const body = text || (imageUrl ? '📷 Photo' : '');
      for (const pid of chat.participantIds) {
        if (pid !== senderId) {
          const chatName = chat.name || chat.participants.find((p: any) => p.id !== senderId)?.name || 'Chat';
          sendPushNotification(pid, sender.name, body, { chatId, messageId: message.id });
        }
      }
    }
  } catch {
    // push is best-effort
  }

  return message;
}
