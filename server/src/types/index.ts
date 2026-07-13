export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup?: boolean;
  creatorId?: string;
  participantIds: string[];
  createdAt: string;
}

export interface ChatWithUsers extends Chat {
  participants: User[];
  lastMessage?: Message;
}

export interface ChatRow {
  id: string;
  name: string | null;
  is_group: boolean;
  creator_id: string | null;
  created_at: string;
  last_message_id?: string;
  last_message_text?: string;
  last_message_image_url?: string;
  last_message_created_at?: string;
  last_message_sender_id?: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_avatar_url: string | null;
  user_created_at: string;
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
  createdAt: string;
}

export interface ReplyPreview {
  messageId: string;
  senderId: string;
  senderName: string;
  text?: string;
  imageUrl?: string;
}
