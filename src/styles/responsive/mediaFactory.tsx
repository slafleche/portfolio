import {
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';
import type { IMediaQueryProps } from '@/styles/responsive/mediaQueries';

// ---------- Query shaping ----------
export function toQueryString(q: IMediaQueryProps): string {
  const mediaType = q.type ?? 'screen';
  const parts: string[] = [];
  if (q.minWidth) parts.push(`(min-width: ${q.minWidth})`);
  if (q.maxWidth) parts.push(`(max-width: ${q.maxWidth})`);
  return parts.length ? `${mediaType} and ${parts.join(' and ')}` : mediaType;
}

export function queriesToStrings<
  T extends Record<string, IMediaQueryProps | string>,
>(queries: T) {
  return Object.fromEntries(
    Object.entries(queries).map(([k,
v]) => [
      k,
      typeof v === 'string' ? v : toQueryString(v),
    ]),
  ) as Record<keyof T & string, string>;
}

// ---------- Core hooks ----------
/** SSR-safe: undefined on server, boolean on client; subscribes to changes. */
export function useMediaQuery(queryString: string) {
  const [matches,
setMatches] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(queryString);
    const onChange = () => setMatches(mql.matches);
    setMatches(mql.matches); // initial snapshot
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [queryString]);

  return matches;
}

/**
 * Aggregate hook for a map of query strings (e.g. { fullSize, compact,
 * compressed }). Avoids calling hooks in a loop by managing all listeners
 * inside one effect.
 */
export function useMediaFromMap<T extends Record<string, string>>(strings: T) {
  type K = keyof T & string;

  // Build a stable signature (same string => no resubscribe)
  const dep = useMemo(() => {
    const entries = Object.entries(strings) as [K, string][];
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([k,
v]) => `${k}:${v}`).join('|');
  }, [strings]);

  const keys = useMemo(() => {
    const ks = Object.keys(strings) as K[];
    ks.sort();
    return ks;
  }, [dep]);

  const [matches,
setMatches] = useState<Record<K, boolean | undefined>>(() => {
    const init = {} as Record<K, boolean | undefined>;
    keys.forEach((k) => (init[k] = undefined));
    return init;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mqls = keys.map((k) => [k,
window.matchMedia(strings[k])] as const);

    // initial snapshot
    setMatches((prev) => {
      const next = { ...prev };
      mqls.forEach(([k,
mql]) => {
        next[k] = mql.matches;
      });
      return next;
    });

    // subscribe
    const handlers = mqls.map(([k,
mql]) => {
      const onChange = () =>
        setMatches((prev) => ({ ...prev, [k]: mql.matches }));
      mql.addEventListener?.('change', onChange);
      return [mql,
onChange] as const;
    });

    // cleanup
    return () => {
      handlers.forEach(([mql,
onChange]) =>
        mql.removeEventListener?.('change', onChange),
      );
    };
  }, [dep,
keys]); // deps are stable unless keys/values actually change

  return matches as { [P in keyof T]: boolean | undefined };
}

// ---------- Client-only predicates ----------
/** For event handlers/effects only; don't call in SSR render paths. */
export function makeClientFns<T extends Record<string, string>>(strings: T) {
  const out = {} as { [K in keyof T]: () => boolean };
  (Object.keys(strings) as (keyof T & string)[]).forEach((k) => {
    out[k] = () =>
      typeof window !== 'undefined'
        ? window.matchMedia(strings[k]).matches
        : false;
  });
  return out;
}

// ---------- Generic component wrapper (optional) ----------
/** Usage: <MatchMedia query={mqStrings.fullSize}>…</MatchMedia> */
export const MatchMedia: FC<PropsWithChildren<{ query: string }>> = ({
  query,
  children,
}) => {
  const match = useMediaQuery(query);
  if (match !== true) return null; // null on server or non-match
  return <>{children}</>;
};
