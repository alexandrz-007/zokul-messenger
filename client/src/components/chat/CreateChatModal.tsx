import { useState, useEffect, useRef } from 'react';
import { useSearchUsers, useCreateChat } from '../../hooks/useChat';
import Modal from '../common/Modal';
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

  return (
    <Modal open={open} onClose={onClose} title="New Chat">
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
        <div className="max-h-72 overflow-y-auto -mx-1">
          {searching && (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">Searching...</div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">No users found</div>
          )}
          {!query && !searching && (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">Type to search users</div>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Avatar name={user.name} size={36} url={user.avatarUrl} />
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user.name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}