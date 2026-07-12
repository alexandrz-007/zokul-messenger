import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Message } from '../../types';
import Avatar from '../common/Avatar';
import TypingIndicator from './TypingIndicator';

interface ChatViewProps {
  messages: Message[];
  currentUserId: string;
  chatId: string;
  loading: boolean;
  error: string;
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function DaySeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
        {formatTime(date)}
      </span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export default function ChatView({ messages, currentUserId, chatId, loading, error }: ChatViewProps) {
  const [typingUsers, setTypingUsers] = useState<Map<string, { userId: string; userName: string }>>(new Map());
  const { socket } = useSocket();
  const bottomRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!socket || !chatId) return;

    const onTyping = (data: { chatId: string; userId: string; userName: string }) => {
      if (data.chatId !== chatId || data.userId === currentUserId) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(data.userId, { userId: data.userId, userName: data.userName });
        return next;
      });

      const existing = timersRef.current.get(data.userId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
        timersRef.current.delete(data.userId);
      }, 4000);
      timersRef.current.set(data.userId, timer);
    };

    socket.on('typing:start', onTyping);
    return () => {
      socket.off('typing:start', onTyping);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [socket, chatId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typingNames = Array.from(typingUsers.values()).map((u) => u.userName);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (messages.length === 0 && typingNames.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Send a message to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      <div className="max-w-2xl mx-auto">
        {[...messages].reverse().map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          const sorted = [...messages].reverse();
          const prev = i > 0 ? sorted[i - 1] : null;
          const sameSender = prev && prev.senderId === msg.senderId;
          const gap = prev ? new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() : 0;
          const showAvatar = !isMine && (!sameSender || gap > 300000);
          const showDay = i > 0 && new Date(msg.createdAt).toDateString() !== new Date(sorted[i - 1].createdAt).toDateString();
          return (
            <div key={msg.id}>
              {(i === 0 || showDay) && <DaySeparator date={new Date(msg.createdAt)} />}
              <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>
                <div className={`w-8 shrink-0 ${isMine ? 'hidden' : ''}`}>
                  {showAvatar && <Avatar name={msg.senderId} size={32} />}
                </div>
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div
                    className={`px-3 py-2 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-primary text-white rounded-[18px] rounded-br-[6px]'
                        : 'bg-gray-100 dark:bg-gray-800 rounded-[18px] rounded-bl-[6px]'
                    }`}
                  >
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="" className="rounded-xl max-w-full mb-1.5 cursor-pointer" loading="lazy" />
                    )}
                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1 flex items-center gap-1">
                    {isMine && <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>}
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {typingNames.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar name={typingNames[0]} size={32} />
            <TypingIndicator names={typingNames} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
