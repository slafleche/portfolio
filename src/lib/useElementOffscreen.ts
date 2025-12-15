import { useCallback, useEffect, useRef, useState } from 'react';

export type UseElementOffscreenOptions = {
  debounceMs?: number;
  ioAuthorityMs?: number;
  rootMargin?: string;
  threshold?: number | number[];
  mode?: 'outside' | 'above' | 'below';
};

const DEFAULT_DEBOUNCE_MS = 80;
const DEFAULT_IO_AUTHORITY_MS = 300;
const DEFAULT_ROOT_MARGIN = '0px';
const DEFAULT_THRESHOLD = 0;
const DEFAULT_MODE: UseElementOffscreenOptions['mode'] = 'outside';

const computeOffscreen = (
  rect: DOMRect,
  mode: UseElementOffscreenOptions['mode'],
): boolean => {
  if (typeof window === 'undefined') return false;
  const viewportHeight = window.innerHeight || 0;

  switch (mode) {
    case 'above':
      return rect.bottom <= 0;
    case 'below':
      return rect.top >= viewportHeight;
    case 'outside':
    default:
      return rect.bottom <= 0 || rect.top >= viewportHeight;
  }
};

/**
 * Observe an element by id and report whether it is off-screen.
 *
 * - Uses IntersectionObserver when available.
 * - Falls back to scroll/resize polling to cover edge cases.
 * - Coalesces IO and polling via an "IO authority" window so they
 *   don't fight each other.
 */
export function useElementOffscreen(
  watchId: string | null | undefined,
  options?: UseElementOffscreenOptions,
): boolean {
  const [
    offscreen,
    setOffscreen,
  ] = useState(false);

  const lastIOSampleRef = useRef(0);
  const debounceTimeoutRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    ioAuthorityMs = DEFAULT_IO_AUTHORITY_MS,
    rootMargin = DEFAULT_ROOT_MARGIN,
    threshold = DEFAULT_THRESHOLD,
    mode = DEFAULT_MODE,
  } = options ?? {};

  const applySignal = useCallback(
    (nextOffscreen: boolean, src: 'IO' | 'poll') => {
      if (typeof window === 'undefined') return;

      if (
        src === 'poll' &&
        ioAuthorityMs > 0 &&
        performance.now() - lastIOSampleRef.current < ioAuthorityMs
      ) {
        return;
      }

      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      const delay = Math.max(0, debounceMs);
      if (delay === 0) {
        setOffscreen(nextOffscreen);
        return;
      }

      debounceTimeoutRef.current = window.setTimeout(() => {
        setOffscreen(nextOffscreen);
        debounceTimeoutRef.current = null;
      }, delay);
    },
    [
      debounceMs,
      ioAuthorityMs,
    ],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    if (!watchId) {
      let resetTimeout: number | null = null;
      if (typeof window !== 'undefined') {
        resetTimeout = window.setTimeout(() => {
          applySignal(false, 'poll');
        }, 0);
      }
      return () => {
        if (resetTimeout !== null && typeof window !== 'undefined') {
          window.clearTimeout(resetTimeout);
        }
      };
    }

    const target = document.getElementById(watchId);
    if (!target) {
      let resetTimeout: number | null = null;
      if (typeof window !== 'undefined') {
        resetTimeout = window.setTimeout(() => {
          applySignal(false, 'poll');
        }, 0);
      }
      return () => {
        if (resetTimeout !== null && typeof window !== 'undefined') {
          window.clearTimeout(resetTimeout);
        }
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const rect = entry.boundingClientRect;
        const off = computeOffscreen(rect, mode);
        lastIOSampleRef.current = performance.now();
        applySignal(off, 'IO');
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    io.observe(target);

    const poll = () => {
      const rect = target.getBoundingClientRect();
      const off = computeOffscreen(rect, mode);
      applySignal(off, 'poll');
    };

    const onScrollOrResize = () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      scrollRafRef.current = window.requestAnimationFrame(poll);
    };

    window.addEventListener('scroll', onScrollOrResize, {
      passive: true,
    });
    window.addEventListener('resize', onScrollOrResize);

    poll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [
    watchId,
    rootMargin,
    threshold,
    applySignal,
    mode,
  ]);

  return offscreen;
}
