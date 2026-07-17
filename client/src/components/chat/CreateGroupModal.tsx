import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useCreateChat } from '../../hooks/useChat';
import Modal from '../common/Modal';
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

  return (
    <Modal open={open} onClose={onClose} title="New Group">
      <div className="space-y-3">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((u) => (
              <button
                key={u.id}
                onClick={() => toggleUser(u)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                {u.name}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />

        <div className="max-h-52 overflow-y-auto -mx-1">
          {searching && (
            <div className="p-3 text-center text-gray-400 dark:text-gray-500 text-sm">Searching...</div>
          )}
          {!searching && query && results.length === 0 && (
            <div className="p-3 text-center text-gray-400 dark:text-gray-500 text-sm">No users found</div>
          )}
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleUser(user)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              <Avatar name={user.name} size={36} url={user.avatarUrl} />
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user.name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</div>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            {creating ? 'Creating...' : `Create Group (${selected.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
}