'use client';

import { useEffect, useRef, useState } from 'react';

type DeferredIslandProps = {
  children: React.ReactNode;
  when?: 'idle' | 'visible' | 'idle-or-visible';
  rootMargin?: string;
  minDelayMs?: number;
};

type RequestIdleCallback = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
) => number;
type CancelIdleCallback = (handle: number) => void;

export default function DeferredIsland({
  children,
  when = 'idle',
  rootMargin = '200px 0px',
  minDelayMs,
}: DeferredIslandProps) {
  const [
    ready,
    setReady,
  ] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ready) return;

    const requestIdleCallback = (
      window as Window & {
        requestIdleCallback?: RequestIdleCallback;
      }
    ).requestIdleCallback;
    const cancelIdleCallback = (
      window as Window & {
        cancelIdleCallback?: CancelIdleCallback;
      }
    ).cancelIdleCallback;

    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let observer: IntersectionObserver | null = null;

    const scheduleReady = () => {
      if (minDelayMs && minDelayMs > 0) {
        timeoutId = window.setTimeout(
          () => setReady(true),
          minDelayMs,
        );
      } else {
        setReady(true);
      }
    };

    const onIdle = () => scheduleReady();
    const onVisible = () => scheduleReady();

    if (when === 'idle' || when === 'idle-or-visible') {
      if (requestIdleCallback) {
        idleId = requestIdleCallback(onIdle);
      } else {
        timeoutId = window.setTimeout(onIdle, 200);
      }
    }

    if (when === 'visible' || when === 'idle-or-visible') {
      const node = rootRef.current;
      if (node) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              onVisible();
            }
          },
          { rootMargin },
        );
        observer.observe(node);
      }
    }

    return () => {
      if (idleId !== null && cancelIdleCallback) {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, [
    minDelayMs,
    ready,
    rootMargin,
    when,
  ]);

  return (
    <div data-deferred="island" ref={rootRef}>
      {ready ? children : null}
    </div>
  );
}
