import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function usePushSubscription() {
  const { token, user } = useAuth();
  const subscribed = useRef(false);

  useEffect(() => {
    if (!token || !user || subscribed.current) return;
    subscribed.current = true;

    async function subscribe() {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) return;

        const res = await fetch('/api/push/vapid-key');
        const { publicKey } = await res.json();

        const newSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subscription: newSub.toJSON() }),
        });
      } catch {
        // push subscription is best-effort
      }
    }

    subscribe();
  }, [token, user]);
}
