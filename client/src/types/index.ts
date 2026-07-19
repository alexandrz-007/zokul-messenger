export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  imageUrls?: string[];
  voiceUrl?: string;
  voiceDuration?: number;
  replyTo?: ReplyPreview;
  isEdited?: boolean;
  readBy?: string[];
  createdAt: string;
}

export interface ReplyPreview {
  messageId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup?: boolean;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
}

export interface ChatDeleted {
  chatId: string;
}
