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

function formatDateLabel(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

function DaySeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5">
        {formatDateLabel(date)}
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
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface">
        <div className="animate-pulse text-gray-400 dark:text-gray-500 text-sm">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (messages.length === 0 && typingNames.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface">
        <div className="text-center px-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-gray-300 dark:text-gray-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 bg-white dark:bg-surface">
      <div className="max-w-[768px] mx-auto">
        <div ref={sentinelRef} />
        {loadingMore && (
          <div className="text-center py-4">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin mx-auto" />
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
          const hasImage = (msg.imageUrls?.length ?? 0) > 0 || !!msg.imageUrl;
          const hasBubble = !!msg.text || !!msg.replyTo || !!msg.voiceUrl;

          return (
            <div key={msg.id}>
              {(i === 0 || showDay) && <DaySeparator date={new Date(msg.createdAt)} />}
              <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-3' : 'mt-0.5'} items-end`}>
                <div className={`w-7 shrink-0 ${isMine || !showAvatar ? 'invisible' : ''}`}>
                  <Avatar name={participants.find((p) => p.id === msg.senderId)?.name || msg.senderId} size={28} url={participants.find((p) => p.id === msg.senderId)?.avatarUrl} />
                </div>
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                  {/* Image content — OUTSIDE bubble, no blue frame */}
                  {(hasImage) && (
                    <div
                      onClick={() => handleActions(msg.id)}
                      onContextMenu={(e) => { e.preventDefault(); handleActions(msg.id); }}
                      className={`cursor-pointer ${hasBubble ? 'mb-1.5' : ''}`}
                    >
                      {(msg.imageUrls?.length ?? 0) > 0 ? (
                        <div onClick={(e) => e.stopPropagation()} className={`rounded-xl overflow-hidden ${isMine ? 'border border-white/10' : ''}`}>
                          <div className={`grid gap-px ${(msg.imageUrls?.length ?? 0) > 1 ? 'grid-cols-2' : ''}`}>
                            {msg.imageUrls?.slice(0, 4).map((url, idx) => (
                              <img key={idx} src={url} alt="" className="w-full h-40 object-cover cursor-pointer" loading="lazy" onClick={() => setViewerUrl(url)} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div onClick={(e) => e.stopPropagation()} className={`rounded-xl overflow-hidden ${isMine ? 'border border-white/10' : ''}`}>
                          <img src={msg.imageUrl} alt="" className="max-w-full cursor-pointer object-cover" loading="lazy" onClick={() => setViewerUrl(msg.imageUrl!)} />
                        </div>
                      )}
                    </div>
                  )}
                  {/* Reply + text + voice bubble */}
                  {(hasBubble) && (
                    <div className="relative">
                      <div
                        className={`px-3 py-2 text-sm leading-relaxed cursor-pointer ${isNew ? 'animate-message-appear' : ''} ${
                          isMine
                            ? 'bg-primary text-white rounded-[18px] rounded-br-[6px]'
                            : 'bg-gray-100 dark:bg-surface-incoming text-gray-900 dark:text-gray-100 rounded-[18px] rounded-bl-[6px]'
                        }`}
                        onClick={() => handleActions(msg.id)}
                        onContextMenu={(e) => { e.preventDefault(); handleActions(msg.id); }}
                      >
                        {msg.replyTo && (
                          <div className="mb-1.5 opacity-90" onClick={(e) => e.stopPropagation()}>
                            <ReplyQuote reply={msg.replyTo} />
                          </div>
                        )}
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
                  )}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 px-1 flex items-center gap-1 select-none">
                    {isMine && (
                      <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current text-gray-400 dark:text-gray-500">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
                      </svg>
                    )}
                    {msg.isEdited && <span className="italic">edited</span>}
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {typingNames.length > 0 && (
          <div className="flex items-center gap-2 mt-2 mb-1">
            <Avatar name={typingNames[0]} size={28} url={participants.find((p) => p.name === typingNames[0])?.avatarUrl} />
            <TypingIndicator names={typingNames} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {viewerUrl && <ImageViewer src={viewerUrl} onClose={() => setViewerUrl(null)} />}
    </div>
  );
}
