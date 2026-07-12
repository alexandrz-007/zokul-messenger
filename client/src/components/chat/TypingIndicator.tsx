interface TypingIndicatorProps {
  names: string[];
}

export default function TypingIndicator({ names }: TypingIndicatorProps) {
  if (names.length === 0) return null;

  const label = names.length === 1
    ? `${names[0]} typing...`
    : `${names.join(', ')} typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 animate-pulse">
      <div className="flex gap-0.5">
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{label}</span>
    </div>
  );
}
