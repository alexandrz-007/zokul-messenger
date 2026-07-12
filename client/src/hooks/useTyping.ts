import { useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

export function useTyping(chatId: string | null) {
  const { socket } = useSocket();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const emitTyping = useCallback(() => {
    if (!socket || !chatId) return;
    socket.emit('message:typing', { chatId });
  }, [socket, chatId]);

  const handleTyping = useCallback(() => {
    emitTyping();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(emitTyping, 3000);
  }, [emitTyping]);

  return { handleTyping };
}
