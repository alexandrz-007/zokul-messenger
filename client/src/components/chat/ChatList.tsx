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
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 86400000;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 px-4 py-2">
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-[42px] h-[42px] rounded-full bg-[#D5DEE9] dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#D5DEE9] dark:bg-gray-800 rounded w-2/3" />
              <div className="h-2.5 bg-[#D5DEE9] dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#DFEAF5] dark:bg-gray-800/50 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-gray-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium text-sm">No chats yet</p>
        <p className="text-xs text-gray-400 mt-1">Tap + to start a conversation</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-red-500">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm text-red-500 font-medium">{message}</p>
      </div>
    </div>
  );
}

export default function ChatList({ chats, selectedId, currentUserId, onSelect, loading, error, unreadCount }: ChatListProps) {
  const { isOnline } = usePresence();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (chats.length === 0) return <EmptyState />;

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => {
        const isGroup = chat.isGroup;
        const other = chat.participants.find((p) => p.id !== currentUserId) || chat.participants[0];
        const online = isOnline(other?.id || '');
        const lastMsg = chat.lastMessage;
        const sender = lastMsg && chat.participants.find((p) => p.id === lastMsg.senderId);
        const preview = lastMsg?.text || (lastMsg?.imageUrl ? 'Photo' : '');
        const count = unreadCount?.(chat.id) || 0;
        const displayName = isGroup ? (chat.name || 'Group') : (other?.name || 'Unknown');
        const isSelected = selectedId === chat.id;
        return (
          <div key={chat.id} className="relative group">
            <button
              onClick={() => onSelect(chat)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 border-l-[3px] transition-colors text-left ${
                isSelected
                  ? 'border-primary bg-[#D7E6F6] dark:bg-gray-800/60'
                  : 'border-transparent hover:bg-[#DFEAF5] dark:hover:bg-gray-800/30'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={displayName} size={42} url={isGroup ? undefined : other?.avatarUrl} />
                {!isGroup && count === 0 && <OnlineDot online={online} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate ${count > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-900 dark:text-gray-100'}`}>
                    {displayName}
                  </span>
                  {lastMsg && (
                    <span className="text-[11px] text-gray-400 ml-2 shrink-0 whitespace-nowrap leading-none">
                      {formatTime(lastMsg.createdAt)}
                    </span>
                  )}
                </div>
                <div className={`flex items-center justify-between ${lastMsg ? 'mt-0.5' : ''}`}>
                  <span className={`text-xs truncate ${count > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>
                    {isGroup && sender ? `${sender.name}: ` : ''}{preview || (other?.email ? other.email.split('@')[0] : '')}
                  </span>
                  {count > 0 && (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
