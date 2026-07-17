import { ReplyPreview } from '../../types';

interface ReplyQuoteProps {
  reply: ReplyPreview;
  onCancel?: () => void;
}

export default function ReplyQuote({ reply, onCancel }: ReplyQuoteProps) {
  return (
    <div className="flex items-center gap-2 pl-2.5 border-l-[3px] border-primary/60">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-primary/90">{reply.senderName}</span>
        <p className="text-xs opacity-80 truncate">
          {reply.text || (reply.imageUrl ? 'Photo' : '')}
        </p>
      </div>
      {onCancel && (
        <button type="button" onClick={onCancel} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 rounded hover:bg-white/10 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}