import {
  buildMediaQueryString,
  type IMediaQueryProps,
} from 'css-calipers/mediaQueries';
import { useCallback,useEffect, useMemo, useState } from 'react';

// ---------- Query shaping ----------
export function toQueryString(q: IMediaQueryProps): string {
  return buildMediaQueryString(q);
}

export function queriesToStrings<
  T extends Record<string, IMediaQueryProps | string>,
>(queries: T): { [K in keyof T]: string } {
  return Object.fromEntries(
    Object.entries(queries).map(([
      k,
      v,
    ]) => [
      k,
      typeof v === 'string' ? v : toQueryString(v),
    ]),
  ) as { [K in keyof T]: string };
}

// ---------- Core hooks ----------
/**
 * SSR-safe: undefined on server, boolean on client; subscribes to
 * changes.
 */
export function useMediaQuery(queryString: string) {
  const [
    matches,
    setMatches,
  ] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(queryString);
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
    queryString,
  ]);

  return matches;
}

// Aggregate hook with guarded updates to avoid loops
export function useMediaFromMap<T extends Record<string, string>>(
  strings: T,
) {
  type K = keyof T & string;

  const shallowEqual = useCallback((
    a: Record<K, boolean | undefined>,
    b: Record<K, boolean | undefined>,
  ) => {
    const ak = Object.keys(a) as K[];
    const bk = Object.keys(b) as K[];
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (a[k] !== b[k]) return false;
    return true;
  }, []);

  // Stable, sorted list of [key, queryString]
  const entries = useMemo(() => {
    const e = Object.entries(strings) as [K, string][];
    e.sort((a, b) => a[0].localeCompare(b[0]));
    return e;
  }, [
    strings,
  ]);

  const [
    matches,
    setMatches,
  ] = useState<Record<K, boolean | undefined>>(
    () => Object.create(null) as Record<K, boolean | undefined>,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mqls = entries.map(
      ([
        k,
        qs,
      ]) =>
        [
          k,
          window.matchMedia(qs),
        ] as const,
    );

    // Initial snapshot — only set if changed
    const initial = Object.fromEntries(
      mqls.map(([
        k,
        mql,
      ]) => [
        k,
        mql.matches,
      ]),
    ) as Record<K, boolean | undefined>;

    const frameId = requestAnimationFrame(() => {
      setMatches((prev) =>
        shallowEqual(prev, initial) ? prev : initial);
    });

    // Subscribe with guarded setState
    const handlers = mqls.map(([
      k,
      mql,
    ]) => {
      const onChange = () =>
        setMatches((prev) => {
          const next = {
            ...prev,
            [k]: mql.matches,
          } as Record<K, boolean | undefined>;
          return shallowEqual(prev, next) ? prev : next;
        });
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
      }
      mql.addListener?.(onChange);
      return () => mql.removeListener?.(onChange);
    });

    return () => {
      cancelAnimationFrame(frameId);
      for (const cleanup of handlers) cleanup();
    };
  }, [
    entries,
    shallowEqual,
  ]);

  return matches as {
    [P in keyof T]: boolean | undefined;
  };
}

// ---------- Client-only predicates ----------
/** For event handlers/effects only; don't call in SSR render paths. */
export function makeClientFns<T extends Record<string, string>>(
  strings: T,
) {
  const out = {} as {
    [K in keyof T]: () => boolean;
  };
  (Object.keys(strings) as (keyof T & string)[]).forEach((k) => {
    out[k] = () =>
      typeof window !== 'undefined'
        ? window.matchMedia(strings[k]).matches
        : false;
  });
  return out;
}
