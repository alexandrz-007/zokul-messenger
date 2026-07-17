import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useCreateChat } from '../../hooks/useChat';
import Avatar from '../common/Avatar';
import { Chat, User } from '../../types';
import { Socket } from 'socket.io-client';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (chat: Chat) => void;
  socket?: Socket | null;
}

export default function CreateGroupModal({ open, onClose, onCreated, socket }: CreateGroupModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected([]);
      setGroupName('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => { clearTimeout(debounceRef.current); };
  }, [open]);

  const handleQuery = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get<User[]>('/users/search', { params: { q: value } });
        setResults(res.data.filter((u) => !selected.find((s) => s.id === u.id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const toggleUser = (user: User) => {
    setSelected((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
    setResults([]);
    setQuery('');
  };

  const handleCreate = async () => {
    if (selected.length < 1 || !groupName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<Chat>('/chats/group', {
        name: groupName.trim(),
        participantIds: selected.map((u) => u.id),
      });
      socket?.emit('chat:created', { chatId: res.data.id });
      onCreated(res.data);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = selected.length >= 1 && groupName.trim().length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" role="dialog" aria-modal="true" aria-label="Create group">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">New Group</h2>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                >
                  {u.name} ✕
                </button>
              ))}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Search users to add..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {searching && (
            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">No users found</div>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleUser(user)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar name={user.name} size={36} url={user.avatarUrl} />
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-gray-400 truncate">{user.email}</div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating...' : `Create Group (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
