'use client';

import { useEffect } from 'react';

export default function SmoothScrollIdle() {
  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    type RequestIdleCallback = (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number;
    type CancelIdleCallback = (handle: number) => void;

    const requestIdleCallback =
      (
        window as Window & {
          requestIdleCallback?: RequestIdleCallback;
        }
      ).requestIdleCallback;
    const cancelIdleCallback =
      (
        window as Window & {
          cancelIdleCallback?: CancelIdleCallback;
        }
      ).cancelIdleCallback;

    const enableSmoothScroll = () => {
      document.documentElement.dataset.smoothScroll = 'true';
    };

    let idleId: number | null = null;
    let timeoutId: number | null = null;

    if (requestIdleCallback) {
      idleId = requestIdleCallback(() => {
        enableSmoothScroll();
      });
    } else {
      timeoutId = window.setTimeout(enableSmoothScroll, 200);
    }

    return () => {
      if (idleId !== null && cancelIdleCallback) {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return null;
}
