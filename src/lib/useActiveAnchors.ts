import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { sharedStrings } from './sharedStrings';
import { getViewportSize } from './responsive/viewport';

export type AnchorTarget = {
  id: string;
  href?: string;
};

export type UseActiveAnchorsOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  manualHoldMs?: number;
  layoutTick?: number;
  hashSync?: {
    enabled?: boolean;
    debounceMs?: number;
    reservedHashes?: string[];
    scrollOnLoad?: boolean;
  };
};

const DEFAULT_ROOT_MARGIN = '-30% 0px -55% 0px';
const DEFAULT_THRESHOLD = 0;
const DEFAULT_MANUAL_HOLD_MS = 800;
const DEFAULT_HASH_DEBOUNCE_MS = 120;

const RESERVED_HASHES = [
  sharedStrings.contactFormHash,
  sharedStrings.contactFormPolicyHash,
  '#contact',
  '#contactform',
  '#contactpolicy',
];

const normalizeHash = (hash: string) =>
  hash.startsWith('#') ? hash.toLowerCase() : `#${hash.toLowerCase()}`;

const isReservedHash = (hash: string, reserved: readonly string[]) => {
  if (!hash) return false;
  const normalized = normalizeHash(hash);
  return reserved.some((reservedHash) => normalizeHash(reservedHash) === normalized);
};

const pickActiveId = (
  anchors: readonly AnchorTarget[],
  rects: Map<string, DOMRectReadOnly>,
): string | null => {
  if (typeof window === 'undefined') return null;

  const viewportHeight = getViewportSize().height ?? 0;
  const scrolledToTop = (window.scrollY || 0) <= 0;
  let bestVisibleId: string | null = null;
  let bestVisibleTop = Number.POSITIVE_INFINITY;
  let bestAboveId: string | null = null;
  let bestAboveTop = Number.NEGATIVE_INFINITY;
  let bestBelowId: string | null = null;
  let bestBelowTop = Number.POSITIVE_INFINITY;

  for (const anchor of anchors) {
    const rect = rects.get(anchor.id);
    if (!rect) continue;
    const { top, bottom } = rect;
    const isVisible = bottom > 0 && top < viewportHeight;

    if (isVisible) {
      if (top < bestVisibleTop) {
        bestVisibleTop = top;
        bestVisibleId = anchor.id;
      }
      continue;
    }

    if (top <= 0 && top > bestAboveTop) {
      bestAboveTop = top;
      bestAboveId = anchor.id;
    } else if (top > 0 && top < bestBelowTop) {
      bestBelowTop = top;
      bestBelowId = anchor.id;
    }
  }

  if (bestVisibleId) return bestVisibleId;
  if (scrolledToTop) return null;
  if (bestAboveId) return bestAboveId;
  if (bestBelowId) return bestBelowId;
  return anchors[0]?.id ?? null;
};

export function useActiveAnchors(
  anchors: readonly AnchorTarget[],
  options?: UseActiveAnchorsOptions,
) {
  const {
    rootMargin = DEFAULT_ROOT_MARGIN,
    threshold = DEFAULT_THRESHOLD,
    manualHoldMs = DEFAULT_MANUAL_HOLD_MS,
    layoutTick,
    hashSync,
  } = options ?? {};

  const [activeId, setActiveId] = useState<string | null>(null);
  const anchorMap = useMemo(
    () =>
      anchors.reduce<Record<string, AnchorTarget>>((map, anchor) => {
        map[anchor.id] = anchor;
        return map;
      }, {}),
    [
      anchors,
    ],
  );

  const orderedAnchors = useMemo(
    () => anchors.filter((anchor) => anchor.id),
    [
      anchors,
    ],
  );
  const anchorHrefSet = useMemo(() => {
    const hrefs = new Set<string>();
    orderedAnchors.forEach((anchor) => {
      const href = anchor.href ?? `#${anchor.id}`;
      hrefs.add(normalizeHash(href));
    });
    return hrefs;
  }, [orderedAnchors]);

  const rectMapRef = useRef<Map<string, DOMRectReadOnly>>(new Map());
  const manualActiveRef = useRef<{
    id: string;
    expiresAt: number;
  } | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);
  const updateFromScrollRef = useRef<(() => void) | null>(null);
  const hashDebounceRef = useRef<number | null>(null);
  const lastSetHashRef = useRef<string | null>(null);
  const initialHashAppliedRef = useRef(false);

  const effectiveActiveId = orderedAnchors.length === 0 ? null : activeId;

  const activeHref = useMemo(() => {
    if (!effectiveActiveId) return null;
    const anchor = anchorMap[effectiveActiveId];
    if (!anchor) return null;
    if (anchor.href) return anchor.href;
    return `#${anchor.id}`;
  }, [
    effectiveActiveId,
    anchorMap,
  ]);

  const setManualActive = useCallback(
    (nextId: string | null) => {
      if (!nextId) {
        manualActiveRef.current = null;
        return;
      }
      const expiresAt = performance.now() + Math.max(0, manualHoldMs);
      manualActiveRef.current = {
        id: nextId,
        expiresAt,
      };
      setActiveId(nextId);
    },
    [
      manualHoldMs,
    ],
  );

  const resolveActiveFromRects = useCallback(() => {
    const now = performance.now();
    const manualActive = manualActiveRef.current;
    const candidateId = pickActiveId(orderedAnchors, rectMapRef.current);

    if (
      manualActive &&
      manualActive.id &&
      manualActive.expiresAt > now &&
      anchorMap[manualActive.id]
    ) {
      if (manualActive.id !== activeId) {
        setActiveId(manualActive.id);
      }
      return;
    }

    manualActiveRef.current = null;

    if (candidateId !== activeId) {
      setActiveId(candidateId);
    }
  }, [
    activeId,
    orderedAnchors,
    anchorMap,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    if (orderedAnchors.length === 0) {
      manualActiveRef.current = null;
      rectMapRef.current.clear();
      return undefined;
    }

    if (!initialHashAppliedRef.current) {
      const {
        enabled = true,
        reservedHashes = RESERVED_HASHES,
        scrollOnLoad = true,
      } = hashSync ?? {};
      if (enabled) {
        const initialHash = window.location.hash;
        if (
          initialHash &&
          !isReservedHash(initialHash, reservedHashes)
        ) {
          const normalized = normalizeHash(initialHash).slice(1);
          const matching = orderedAnchors.find(
            (anchor) =>
              normalizeHash(anchor.href ?? `#${anchor.id}`).slice(1) === normalized ||
              anchor.id.toLowerCase() === normalized,
          );
          if (matching) {
            manualActiveRef.current = {
              id: matching.id,
              expiresAt: performance.now() + Math.max(0, manualHoldMs),
            };
            if (scrollOnLoad) {
              const node = document.getElementById(matching.id);
              if (node && typeof node.scrollIntoView === 'function') {
                setTimeout(() => {
                  node.scrollIntoView({ block: 'start', behavior: 'auto' });
                }, 0);
              }
            }
          }
        }
      }
      initialHashAppliedRef.current = true;
    }

    const nodes: Array<HTMLElement | null> = orderedAnchors.map((anchor) =>
      document.getElementById(anchor.id),
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const targetId = entry.target.id;
          if (!targetId) return;
          rectMapRef.current.set(targetId, entry.boundingClientRect);
        });
        resolveActiveFromRects();
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    ioRef.current = io;
    nodes.forEach((node) => {
      if (!node) return;
      io.observe(node);
    });

    const updateFromScroll = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = window.requestAnimationFrame(() => {
        nodes.forEach((node) => {
          if (!node) return;
          rectMapRef.current.set(node.id, node.getBoundingClientRect());
        });
        resolveActiveFromRects();
      });
    };
    updateFromScrollRef.current = updateFromScroll;

    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);

    updateFromScroll();

    return () => {
      io.disconnect();
      ioRef.current = null;
      window.removeEventListener('scroll', updateFromScroll);
      window.removeEventListener('resize', updateFromScroll);
      updateFromScrollRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    hashSync,
    manualHoldMs,
    orderedAnchors,
    resolveActiveFromRects,
    rootMargin,
    threshold,
  ]);

  useEffect(() => {
    if (layoutTick == null) return;
    updateFromScrollRef.current?.();
  }, [
    layoutTick,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const {
      enabled = true,
      debounceMs = DEFAULT_HASH_DEBOUNCE_MS,
      reservedHashes = RESERVED_HASHES,
    } = hashSync ?? {};

    if (!enabled) return;

    const applyHash = (nextHash: string | null) => {
      if (!nextHash) return;
      if (isReservedHash(window.location.hash, reservedHashes)) return;
      if (isReservedHash(nextHash, reservedHashes)) return;
      const normalizedNext = normalizeHash(nextHash);
      const current = normalizeHash(window.location.hash);
      if (normalizedNext === current || lastSetHashRef.current === normalizedNext) {
        return;
      }
      lastSetHashRef.current = normalizedNext;
      window.history.replaceState(window.history.state, '', normalizedNext);
    };

    if (!activeHref) {
      if (hashDebounceRef.current !== null) {
        window.clearTimeout(hashDebounceRef.current);
        hashDebounceRef.current = null;
      }
      const current = normalizeHash(window.location.hash);
      if (
        current &&
        !isReservedHash(current, reservedHashes) &&
        (anchorHrefSet.has(current) ||
          lastSetHashRef.current === current)
      ) {
        const { pathname, search } = window.location;
        window.history.replaceState(
          window.history.state,
          '',
          `${pathname}${search}`,
        );
        lastSetHashRef.current = null;
      }
      return;
    }

    if (hashDebounceRef.current !== null) {
      window.clearTimeout(hashDebounceRef.current);
    }

    hashDebounceRef.current = window.setTimeout(() => {
      applyHash(activeHref);
    }, Math.max(0, debounceMs));

    return () => {
      if (hashDebounceRef.current !== null) {
        window.clearTimeout(hashDebounceRef.current);
        hashDebounceRef.current = null;
      }
    };
  }, [
    activeHref,
    anchorHrefSet,
    hashSync,
    orderedAnchors,
  ]);

  return {
    activeId: effectiveActiveId,
    activeHref,
    setManualActive,
  };
}
