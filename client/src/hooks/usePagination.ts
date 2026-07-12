import { useRef, useCallback, useState } from 'react';
import api from '../services/api';
import { Message } from '../types';

export function usePagination(chatId: string | null) {
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async (): Promise<Message[]> => {
    if (!chatId || loadingRef.current || !hasMore) return [];
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const params: any = { limit: 30 };
      if (offsetRef.current > 0) params.offset = offsetRef.current;
      const res = await api.get<Message[]>(`/chats/${chatId}/messages`, { params });
      const msgs = res.data;
      if (msgs.length < 30) setHasMore(false);
      if (msgs.length > 0) {
        offsetRef.current += msgs.length;
      }
      return msgs;
    } catch {
      return [];
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [chatId, hasMore]);

  const reset = useCallback(() => {
    setHasMore(true);
    offsetRef.current = 0;
  }, []);

  return { loadMore, loadingMore, hasMore, reset };
}
