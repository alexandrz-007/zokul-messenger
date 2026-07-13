import { useState, useEffect, useRef } from 'react';
import { useSearchUsers, useCreateChat } from '../../hooks/useChat';
import Avatar from '../common/Avatar';
import { Chat, User } from '../../types';

interface CreateChatModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (chat: Chat) => void;
}

export default function CreateChatModal({ open, onClose, onCreated }: CreateChatModalProps) {
  const [query, setQuery] = useState('');
  const { results, loading: searching, search } = useSearchUsers();
  const { create, loading: creating } = useCreateChat();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => { clearTimeout(debounceRef.current); };
  }, [open]);

  const handleQuery = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = async (user: User) => {
    const chat = await create(user.id);
    if (chat) {
      onCreated(chat);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" role="dialog" aria-modal="true" aria-label="New chat">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">New Chat</h2>
        </div>
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {searching && (
            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">No users found</div>
          )}
          {!query && !searching && (
            <div className="p-4 text-center text-gray-400 text-sm">Type to search users</div>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Avatar name={user.name} size={40} />
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
