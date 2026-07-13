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
  imageUrl?: string,
  voiceUrl?: string,
  voiceDuration?: number,
  replyToId?: string,
  imageUrls?: string[]
): Promise<Message> {
  if (!text && !imageUrl && !voiceUrl && !imageUrls?.length) {
    throw new Error('Message must have text, image, or voice');
  }
  const message = await MessageModel.create(chatId, senderId, text, imageUrl, voiceUrl, voiceDuration, replyToId, imageUrls);
  logger(`Message created in chat ${chatId}`);

  try {
    const chat = await ChatModel.findChatById(chatId);
    const sender = await UserModel.findById(senderId);
    if (chat && sender) {
      const body = text || (imageUrl ? 'Photo' : voiceUrl ? 'Voice' : '');
      for (const pid of chat.participantIds) {
        if (pid !== senderId) {
          sendPushNotification(pid, sender.name, body, { chatId, messageId: message.id });
        }
      }
    }
  } catch {
    // push is best-effort
  }

  return message;
}

export async function editMessage(
  messageId: string,
  text: string,
  userId: string
): Promise<Message> {
  if (!text.trim()) throw new Error('Message text is required');
  const existing = await MessageModel.findById(messageId);
  if (!existing) throw new Error('Message not found');
  if (existing.senderId !== userId) throw new Error('Not authorized to edit this message');
  const message = await MessageModel.updateMessage(messageId, text);
  if (!message) throw new Error('Message not found');
  return message;
}

export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<{ chatId: string }> {
  const msg = await MessageModel.findById(messageId);
  if (!msg) throw new Error('Message not found');
  if (msg.senderId !== userId) throw new Error('Not authorized to delete this message');
  const deleted = await MessageModel.softDelete(messageId);
  if (!deleted) throw new Error('Message not found');
  return { chatId: msg.chatId };
}
