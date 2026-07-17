import { useEffect, useRef } from 'react';
import { Message } from '../../types';

interface MessageActionsProps {
  message: Message;
  isMine: boolean;
  onClose: () => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MessageActions({ message, isMine, onClose, onReply, onEdit, onDelete }: MessageActionsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-20 bottom-full right-0 mb-1 bg-[#F8FAFD] dark:bg-gray-800 rounded-xl shadow-lg border border-[#D5DEE9] dark:border-gray-700 overflow-hidden min-w-[120px]">
      <button onClick={() => { onReply(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#DFEAF5] dark:hover:bg-gray-700 text-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Reply
      </button>
      {isMine && onEdit && (
        <button onClick={() => { onEdit(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#DFEAF5] dark:hover:bg-gray-700 text-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
      )}
      {isMine && onDelete && (
        <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#DFEAF5] dark:hover:bg-gray-700 text-left text-red-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete
        </button>
      )}
    </div>
  );
}
