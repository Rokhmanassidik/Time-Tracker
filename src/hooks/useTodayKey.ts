import { useEffect, useState } from 'react';
import { toDateKey } from '../lib/date';

/** Local YYYY-MM-DD, re-checked periodically; only re-renders when the day actually changes. */
export function useTodayKey(pollMs = 30_000): string {
  const [key, setKey] = useState(() => toDateKey());

  useEffect(() => {
    const id = setInterval(() => {
      setKey((prev) => {
        const next = toDateKey();
        return prev === next ? prev : next;
      });
    }, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  return key;
}
