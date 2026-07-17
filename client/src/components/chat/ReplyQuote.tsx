import { ReplyPreview } from '../../types';

interface ReplyQuoteProps {
  reply: ReplyPreview;
  onCancel?: () => void;
}

export default function ReplyQuote({ reply, onCancel }: ReplyQuoteProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E1EAF4] dark:bg-gray-800 rounded-t-2xl border-l-4 border-primary">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-primary">{reply.senderName}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {reply.text || (reply.imageUrl ? 'Photo' : '')}
        </p>
      </div>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
