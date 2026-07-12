import { useState, useEffect, useCallback } from 'react';

export function useDraft(chatId: string | null) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!chatId) { setDraft(''); return; }
    const saved = sessionStorage.getItem(`draft:${chatId}`);
    if (saved) setDraft(saved);
    else setDraft('');
  }, [chatId]);

  const saveDraft = useCallback((text: string) => {
    if (!chatId) return;
    if (text.trim()) {
      sessionStorage.setItem(`draft:${chatId}`, text);
    } else {
      sessionStorage.removeItem(`draft:${chatId}`);
    }
    setDraft(text);
  }, [chatId]);

  const clearDraft = useCallback(() => {
    if (!chatId) return;
    sessionStorage.removeItem(`draft:${chatId}`);
    setDraft('');
  }, [chatId]);

  return { draft, saveDraft, clearDraft };
}
