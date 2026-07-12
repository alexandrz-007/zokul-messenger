import { useState, useRef, FormEvent } from 'react';
import api from '../../services/api';

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage?: (imageUrl: string) => void;
  onTyping?: () => void;
}

const EMOJIS = ['😀','😁','😂','🤣','😊','😎','🥰','😍','🤩','😋','🤔','🙄','😴','🥳','😇','🙃','😤','😢','😭','🥺','🤗','😡','🔥','💀','🎉','❤️','💔','👍','👎','👏','🙏','💪','🤝','🎂','👋','✌️','🤞','💀','⭐','✅','❌','📱','💬','😅','🤯','🫡','😏','🥴','🫠'];

export default function MessageInput({ onSend, onSendImage, onTyping }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping?.();
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/upload', formData);
      onSendImage?.(res.data.url);
    } catch {
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const pickEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
    setShowEmoji(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-9 h-9 mb-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center shrink-0"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
      <div ref={emojiRef} className="relative flex-1">
        {showEmoji && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto z-10">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => pickEmoji(e)} className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-lg flex items-center justify-center">
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Message..."
            className="flex-1 bg-transparent focus:outline-none text-sm leading-5 py-0.5"
          />
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
      {uploadError && <span className="text-xs text-red-500 absolute -top-5 left-3">{uploadError}</span>}
    </form>
  );
}
