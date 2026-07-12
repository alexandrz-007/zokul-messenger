import { createContext, useContext, useState, ReactNode } from 'react';
import { Message, ReplyPreview } from '../types';

interface ChatContextType {
  replyTo: ReplyPreview | null;
  setReplyTo: (msg: ReplyPreview | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (msg: Message | null) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [replyTo, setReplyTo] = useState<ReplyPreview | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  return (
    <ChatContext.Provider value={{ replyTo, setReplyTo, editingMessage, setEditingMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
