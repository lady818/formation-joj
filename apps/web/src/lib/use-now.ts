import { useEffect, useState } from 'react';

/** L'heure courante, rafraîchie toutes les `intervalMs` millisecondes. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
