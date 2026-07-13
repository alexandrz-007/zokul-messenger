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
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl" />
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
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-gray-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No chats yet</p>
          <p className="text-sm text-gray-400 mt-1">Tap + to start messaging</p>
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
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => {
        const other = chat.participants.find((p) => p.id !== currentUserId) || chat.participants[0];
        const online = isOnline(other?.id || '');
        const lastMsg = chat.lastMessage;
        const preview = lastMsg?.text || (lastMsg?.imageUrl ? 'Photo' : '');
        const count = unreadCount?.(chat.id) || 0;
        return (
          <div key={chat.id} className="relative group">
            <button
              onClick={() => onSelect(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors ${
                selectedId === chat.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={other?.name || '?'} size={48} />
                {count === 0 && <OnlineDot online={online} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-sm truncate ${count > 0 ? 'font-semibold' : 'font-medium'}`}>
                    {other?.name || 'Unknown'}
                  </span>
                  {lastMsg && (
                    <span className="text-[11px] text-gray-400 ml-2 shrink-0">
                      {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs truncate ${count > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400'}`}>
                    {preview || (other?.email ? other.email.split('@')[0] : '')}
                  </span>
                  {count > 0 && (
                    <span className="shrink-0 ml-2 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center px-1">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteRequest(e, chat.id)}
                className="shrink-0 p-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                title="Delete chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </button>
            {deleteTarget === chat.id && (
              <div className="absolute right-2 top-12 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
                <p className="text-xs text-gray-500 mb-2 px-1">Delete this chat?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(chat.id)}
                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
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
