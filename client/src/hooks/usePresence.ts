import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

export function usePresence(currentUserId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set(currentUserId ? [currentUserId] : []));
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (data: { userId: string; status: 'online' | 'offline' }) => {
      if (data.userId === currentUserId) return;
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === 'online') {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    const heartbeat = () => {
      socket.emit('heartbeat');
    };

    socket.on('presence:update', handler);
    const interval = setInterval(heartbeat, 15000);

    return () => {
      socket.off('presence:update', handler);
      clearInterval(interval);
    };
  }, [socket, currentUserId]);

  const isOnline = useCallback(
    (userId: string) => userId === currentUserId || onlineUsers.has(userId),
    [onlineUsers, currentUserId]
  );

  return { isOnline, onlineUsers };
}
