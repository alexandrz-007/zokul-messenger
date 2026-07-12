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
  createdAt: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup?: boolean;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  createdAt: string;
}
