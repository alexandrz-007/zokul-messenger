import { useState } from 'react';
import { usePresence } from '../../hooks/usePresence';
import { Chat } from '../../types';
import Avatar from '../common/Avatar';
import OnlineDot from './OnlineDot';

interface ChatListProps {
  chats: Chat[];
  selectedId?: string;
  currentUserId: string;
  onSelect: (chat: Chat) => void;
  loading: boolean;
  error: string;
  unreadCount?: (chatId: string) => number;
  onDelete?: (chatId: string) => void;
}

export default function ChatList({ chats, selectedId, currentUserId, onSelect, loading, error, unreadCount, onDelete }: ChatListProps) {
  const { isOnline } = usePresence();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500 text-sm">{error}</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-gray-300 dark:text-gray-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No chats yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Tap + to start messaging</p>
        </div>
      </div>
    );
  }

  const handleDeleteRequest = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setDeleteTarget(deleteTarget === chatId ? null : chatId);
  };

  const handleConfirmDelete = (chatId: string) => {
    setDeleteTarget(null);
    onDelete?.(chatId);
  };

  return (
    <div className="overflow-y-auto flex-1">
      {chats.map((chat) => {
        const isGroup = chat.isGroup;
        const other = chat.participants.find((p) => p.id !== currentUserId) || chat.participants[0];
        const online = isOnline(other?.id || '');
        const lastMsg = chat.lastMessage;
        const sender = lastMsg && chat.participants.find((p) => p.id === lastMsg.senderId);
        const preview = lastMsg?.text || (lastMsg?.imageUrl ? 'Photo' : '');
        const count = unreadCount?.(chat.id) || 0;
        const displayName = isGroup ? (chat.name || 'Group') : (other?.name || 'Unknown');
        return (
          <div key={chat.id} className="relative">
            <button
              onClick={() => onSelect(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3 min-h-[60px] active:bg-gray-50 dark:active:bg-white/[0.04] transition-colors ${
                selectedId === chat.id ? 'bg-gray-50 dark:bg-white/[0.06]' : ''
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={displayName} size={44} url={isGroup ? undefined : other?.avatarUrl} />
                {!isGroup && count === 0 && <OnlineDot online={online} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm truncate ${count > 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-900 dark:text-gray-100'}`}>
                    {displayName}
                  </span>
                  {lastMsg && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2 shrink-0 tabular-nums">
                      {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs truncate ${count > 0 ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                    {isGroup && sender ? `${sender.name}: ` : ''}{preview || (other?.email ? other.email.split('@')[0] : '')}
                  </span>
                  {count > 0 && (
                    <span className="shrink-0 ml-2 min-w-[20px] h-5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center px-1.5">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteRequest(e, chat.id)}
                className="shrink-0 w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Delete chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </button>
            {deleteTarget === chat.id && (
              <div className="absolute right-2 top-14 z-10 bg-white dark:bg-surface-elevated border border-gray-200/80 dark:border-white/10 rounded-xl shadow-xl p-2.5 min-w-[160px]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5 px-1">Delete this chat?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(chat.id)}
                    className="flex-1 px-3 py-2 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}