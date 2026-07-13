import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { Chat, Message, User } from '../types';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { socket } = useSocket();
  const chatsRef = useRef(chats);
  chatsRef.current = chats;

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get<Chat[]>('/chats')
      .then((res) => setChats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load chats'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { chatId: string }) => {
      load();
    };
    socket.on('chat:new-room', handler);
    return () => { socket.off('chat:new-room', handler); };
  }, [socket, load]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => {
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.chatId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: msg };
        updated.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt;
          const bTime = b.lastMessage?.createdAt || b.createdAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
        return updated;
      });
    };
    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [socket]);

  return { chats, loading, error, reload: load };
}

export function useUnread(selectedChatId: string | null) {
  const [unread, setUnread] = useState<Map<string, number>>(new Map());
  const { socket } = useSocket();
  const selectedRef = useRef(selectedChatId);
  selectedRef.current = selectedChatId;

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => {
      if (msg.chatId !== selectedRef.current) {
        setUnread((prev) => {
          const next = new Map(prev);
          next.set(msg.chatId, (next.get(msg.chatId) || 0) + 1);
          return next;
        });
      }
    };
    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [socket]);

  const markRead = useCallback((chatId: string) => {
    setUnread((prev) => {
      if (!prev.has(chatId)) return prev;
      const next = new Map(prev);
      next.delete(chatId);
      return next;
    });
  }, []);

  const count = useCallback((chatId: string) => unread.get(chatId) || 0, [unread]);

  return { unread, markRead, count };
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    if (!chatId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api.get<Message[]>(`/chats/${chatId}/messages`, { signal: controller.signal })
      .then((res) => setMessages(res.data))
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError(err.response?.data?.error || 'Failed to load messages');
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;
    const onNew = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [message, ...prev]);
      }
    };
    const onEdited = (msg: Message) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, text: msg.text, isEdited: true } : m));
      }
    };
    const onDeleted = (data: { messageId: string; chatId: string }) => {
      if (data.chatId === chatId) {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      }
    };
    socket.on('message:new', onNew);
    socket.on('message:edited', onEdited);
    socket.on('message:deleted', onDeleted);
    return () => {
      socket.off('message:new', onNew);
      socket.off('message:edited', onEdited);
      socket.off('message:deleted', onDeleted);
    };
  }, [socket, chatId]);

  const sendMessage = useCallback((text: string) => {
    if (!socket || !chatId) return;
    socket.emit('message:send', { chatId, text });
  }, [socket, chatId]);

  const sendImage = useCallback((imageUrl: string) => {
    if (!socket || !chatId) return;
    socket.emit('message:send', { chatId, imageUrl });
  }, [socket, chatId]);

  const sendImages = useCallback((imageUrls: string[]) => {
    if (!socket || !chatId) return;
    socket.emit('message:send', { chatId, imageUrls });
  }, [socket, chatId]);

  const sendVoice = useCallback((voiceUrl: string, voiceDuration: number) => {
    if (!socket || !chatId) return;
    socket.emit('message:send', { chatId, voiceUrl, voiceDuration });
  }, [socket, chatId]);

  const editMessage = useCallback((messageId: string, text: string, chatId: string) => {
    if (!socket) return;
    socket.emit('message:edit', { messageId, text, chatId });
  }, [socket]);

  const deleteMessage = useCallback((messageId: string, chatId: string) => {
    if (!socket) return;
    socket.emit('message:delete', { messageId, chatId });
  }, [socket]);

  const prependMessages = useCallback((older: Message[]) => {
    setMessages((prev) => [...older, ...prev]);
  }, []);

  return { messages, loading, error, sendMessage, sendImage, sendImages, sendVoice, editMessage, deleteMessage, prependMessages };
}

export function useSearchUsers() {
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<User[]>('/users/search', { params: { q: query } });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}

export function useCreateChat() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (participantId: string): Promise<Chat | null> => {
    setLoading(true);
    try {
      const res = await api.post<Chat>('/chats', { participantId });
      return res.data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}
