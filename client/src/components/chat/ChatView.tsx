import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useChatContext } from '../../contexts/ChatContext';
import { Message, ReplyPreview, User } from '../../types';
import Avatar from '../common/Avatar';
import TypingIndicator from './TypingIndicator';
import MessageActions from './MessageActions';
import ReplyQuote from './ReplyQuote';
import VoicePlayer from './VoicePlayer';
import ImageViewer from './ImageViewer';
import '../animations.css';

interface ChatViewProps {
  messages: Message[];
  currentUserId: string;
  currentUserName: string;
  participants: User[];
  chatId: string;
  loading: boolean;
  error: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onMessageEdit?: (messageId: string, text: string, chatId: string) => void;
  onMessageDelete?: (messageId: string, chatId: string) => void;
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
    <div className="flex justify-center my-2">
      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
        {formatTime(date)}
      </span>
    </div>
  );
}

export default function ChatView({ messages, currentUserId, currentUserName, participants, chatId, loading, error, hasMore, loadingMore, onLoadMore, onMessageEdit, onMessageDelete }: ChatViewProps) {
  const [typingUsers, setTypingUsers] = useState<Map<string, { userId: string; userName: string }>>(new Map());
  const [actionsMsg, setActionsMsg] = useState<string | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const { socket } = useSocket();
  const { setReplyTo, setEditingMessage } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const prevCountRef = useRef(messages.length);
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    if (chatIdRef.current !== chatId) {
      chatIdRef.current = chatId;
      prevCountRef.current = 0;
    }
    if (messages.length > prevCountRef.current && messages.length > 0) {
      if (prevCountRef.current === 0) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
      } else {
        const newest = messages[0];
        const isRecent = Date.now() - new Date(newest.createdAt).getTime() < 2000;
        if (isRecent) {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, chatId]);

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

    const onEdited = (msg: Message) => {
      if (msg.chatId !== chatId) return;
    };

    const onDeleted = (data: { messageId: string; chatId: string }) => {
      if (data.chatId !== chatId) return;
    };

    socket.on('typing:start', onTyping);
    socket.on('message:edited', onEdited);
    socket.on('message:deleted', onDeleted);
    return () => {
      socket.off('typing:start', onTyping);
      socket.off('message:edited', onEdited);
      socket.off('message:deleted', onDeleted);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [socket, chatId, currentUserId]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  const handleActions = (msgId: string) => {
    setActionsMsg((prev) => prev === msgId ? null : msgId);
  };

  const handleReply = (msg: Message) => {
    const sender = participants.find((p) => p.id === msg.senderId);
    const preview: ReplyPreview = {
      messageId: msg.id,
      senderId: msg.senderId,
      senderName: sender?.name || msg.senderId,
      text: msg.text,
      imageUrl: msg.imageUrl,
    };
    setReplyTo(preview);
    setActionsMsg(null);
  };

  const handleEdit = (msg: Message) => {
    setEditingMessage(msg);
    setActionsMsg(null);
  };

  const handleDelete = (msg: Message) => {
    if (!onMessageDelete) return;
    if (window.confirm('Delete this message?')) {
      onMessageDelete(msg.id, chatId);
    }
    setActionsMsg(null);
  };

  const typingNames = Array.from(typingUsers.values()).map((u) => u.userName);
  const sortedMessages = [...messages].reverse();

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
      <div className="px-1 sm:px-2">
        <div ref={sentinelRef} />
        {loadingMore && (
          <div className="text-center py-3">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
        {sortedMessages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          const prev = i > 0 ? sortedMessages[i - 1] : null;
          const sameSender = prev && prev.senderId === msg.senderId;
          const gap = prev ? new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() : 0;
          const showAvatar = !isMine && (!sameSender || gap > 300000);
          const showDay = i > 0 && new Date(msg.createdAt).toDateString() !== new Date(sortedMessages[i - 1].createdAt).toDateString();
          const isNew = Date.now() - new Date(msg.createdAt).getTime() < 10000;
          return (
            <div key={msg.id}>
              {(i === 0 || showDay) && <DaySeparator date={new Date(msg.createdAt)} />}
              <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}>
                <div className={`w-8 shrink-0 ${isMine ? 'hidden' : ''}`}>
                  {showAvatar && <Avatar name={participants.find((p) => p.id === msg.senderId)?.name || msg.senderId} size={32} url={participants.find((p) => p.id === msg.senderId)?.avatarUrl} />}
                </div>
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="relative">
                    <div
                      className={`px-3 py-2 text-sm leading-relaxed cursor-pointer ${isNew ? 'animate-message-appear' : ''} ${
                        isMine
                          ? 'bg-primary text-white rounded-[18px] rounded-br-[6px]'
                          : 'bg-gray-100 dark:bg-gray-800 rounded-[18px] rounded-bl-[6px]'
                      }`}
                      onClick={() => handleActions(msg.id)}
                      onContextMenu={(e) => { e.preventDefault(); handleActions(msg.id); }}
                    >
                      {msg.replyTo && (
                        <div className="mb-1.5" onClick={(e) => e.stopPropagation()}>
                          <ReplyQuote reply={msg.replyTo} />
                        </div>
                      )}
                      {(msg.imageUrls?.length ?? 0) > 0 ? (
                        <div onClick={(e) => e.stopPropagation()} className={`grid gap-0.5 mb-1.5 rounded-xl overflow-hidden ${(msg.imageUrls?.length ?? 0) > 1 ? 'grid-cols-2' : ''}`}>
                          {msg.imageUrls?.slice(0, 4).map((url, idx) => (
                            <img key={idx} src={url} alt="" className="w-full h-40 object-cover cursor-pointer" loading="lazy" onClick={() => setViewerUrl(url)} />
                          ))}
                        </div>
                      ) : msg.imageUrl ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <img src={msg.imageUrl} alt="" className="rounded-xl max-w-full mb-1.5 cursor-pointer" loading="lazy" onClick={() => setViewerUrl(msg.imageUrl!)} />
                        </div>
                      ) : null}
                      {msg.voiceUrl && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <VoicePlayer voiceUrl={msg.voiceUrl} voiceDuration={msg.voiceDuration} />
                        </div>
                      )}
                      {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                    </div>
                    {actionsMsg === msg.id && (
                      <MessageActions
                        message={msg}
                        isMine={isMine}
                        onClose={() => setActionsMsg(null)}
                        onReply={() => handleReply(msg)}
                        onEdit={isMine ? () => handleEdit(msg) : undefined}
                        onDelete={isMine ? () => handleDelete(msg) : undefined}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1 flex items-center gap-1">
                    {isMine && <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>}
                    {msg.isEdited && <span className="italic">edited</span>}
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {typingNames.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar name={typingNames[0]} size={32} url={participants.find((p) => p.name === typingNames[0])?.avatarUrl} />
            <TypingIndicator names={typingNames} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {viewerUrl && <ImageViewer src={viewerUrl} onClose={() => setViewerUrl(null)} />}
    </div>
  );
}
