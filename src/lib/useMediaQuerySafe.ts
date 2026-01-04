// useMediaQuerySafe.ts
import { useEffect, useState } from 'react';

export function useMediaQuerySafe(query: string) {
  const [
    matches,
    setMatches,
  ] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    const frameId = requestAnimationFrame(() => {
      setMatches(mql.matches);
    });
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
    } else {
      mql.addListener?.(onChange);
    }
    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onChange);
      } else {
        mql.removeListener?.(onChange);
      }
      cancelAnimationFrame(frameId);
    };
  }, [
    query,
  ]);

  return matches; // undefined on server, boolean on client
}
