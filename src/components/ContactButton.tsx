// FILE: src/components/ContactButton.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import * as s from '@/styles/components/contactButton.css';
import SendIcon from '@/components/icons/SendIcon';

type Phase = 'hidden' | 'entering' | 'shown' | 'exiting';

export default function ContactButton({
  watchId,
  href,
  label,
  className,
}: {
  watchId: string;
  href: string;
  label: string;
  className?: string;
}) {
  const [
    phase,
    _setPhase,
  ] = useState<Phase>('hidden');
  const phaseRef = useRef<Phase>('hidden');
  const phaseSinceRef = useRef<number>(Date.now());

  const shuttleRef = useRef<HTMLDivElement | null>(null);
  const tDebounceRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const pendingExitRef = useRef(false);
  const wantVisibleRef = useRef<boolean>(false);

  // IO authority window to prevent IO vs poll flapping
  const lastIOSampleRef = useRef<number>(0);
  const IO_AUTHORITY_MS = 300;

  // Tunables
  const VISIBLE_DEBOUNCE_MS = 80;
  const MIN_SHOWN_DWELL_MS = 200;

  // --- Logging helpers -------------------------------------------------------
  const T0 = useRef<number>(performance.now());
  const nowMs = () => Math.round(performance.now() - T0.current);
  const since = () => Date.now() - phaseSinceRef.current;

  const L = (...a: any[]) =>
    console.log('[ContactButton]', `${nowMs()}ms`, ...a);

  const logCSS = (when: string) => {
    const el = shuttleRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    L(`CSS @ ${when}:`, {
      transitionProperty: cs.transitionProperty,
      transitionDuration: cs.transitionDuration,
      transitionTimingFunction: cs.transitionTimingFunction,
      transitionDelay: cs.transitionDelay,
      animationName: cs.animationName,
      animationDuration: cs.animationDuration,
      animationTimingFunction: cs.animationTimingFunction,
      animationDelay: cs.animationDelay,
      transform: cs.transform,
      willChange: cs.willChange,
    });
  };

  const setPhase = useCallback((next: Phase, why?: string) => {
    if (next === phaseRef.current) return;
    const prev = phaseRef.current;
    phaseRef.current = next;
    _setPhase(next);
    const dt = since();
    phaseSinceRef.current = Date.now();
    L(`PHASE ${prev} -> ${next}${why ? `  (${why})` : ''}`, {
      dtFromPrevMs: dt,
    });
    logCSS(`phase=${next}`);
  }, []);

  // --- Mirror data-phase (do NOT touch inline transform) ---------------------
  useEffect(() => {
    const el = shuttleRef.current;
    if (!el) return;
    el.dataset.phase = phase;
  }, [
    phase,
  ]);

  // --- Mount diagnostics -----------------------------------------------------
  useEffect(() => {
    L('MOUNT', { watchId });
    logCSS('mount');
    return () => {
      L('UNMOUNT');
    };
  }, [
    watchId,
  ]);

  // --- Transition/Animation end -> complete phases ---------------------------
  useEffect(() => {
    const el = shuttleRef.current;
    if (!el) return;

    const onTransitionEnd = (e: globalThis.TransitionEvent) => {
      if (e.target !== el) return;
      if (e.propertyName !== 'transform') {
        L('transitionend (ignored)', { prop: e.propertyName });
        return;
      }
      L('transitionend', {
        prop: e.propertyName,
        phase: phaseRef.current,
      });
      if (phaseRef.current === 'entering') {
        setPhase('shown', 'enter finished');
        if (!wantVisibleRef.current) {
          L('post-enter wants HIDDEN → request exit');
          requestExitIfAllowed('post-enter check');
        }
      } else if (phaseRef.current === 'exiting') {
        setPhase('hidden', 'exit finished');
      }
    };

    const onAnimationEnd = (e: globalThis.AnimationEvent) => {
      if (e.target !== el) return;
      L('animationend', {
        name: e.animationName,
        phase: phaseRef.current,
      });
      if (phaseRef.current === 'entering') {
        setPhase('shown', 'enter (keyframes) finished');
        if (!wantVisibleRef.current) {
          L('post-enter wants HIDDEN → request exit');
          requestExitIfAllowed('post-enter check (keyframes)');
        }
      } else if (phaseRef.current === 'exiting') {
        setPhase('hidden', 'exit (keyframes) finished');
      }
    };

    el.addEventListener('transitionend', onTransitionEnd);
    el.addEventListener('animationend', onAnimationEnd);
    return () => {
      el.removeEventListener('transitionend', onTransitionEnd);
      el.removeEventListener('animationend', onAnimationEnd);
    };
  }, [
    setPhase,
  ]);

  // --- Visibility signal handling -------------------------------------------
  const applySignal = useCallback(
    (wantVisible: boolean, src: 'IO' | 'poll') => {
      // IO is authoritative for a short window; ignore poll during it
      if (
        src === 'poll' &&
        performance.now() - lastIOSampleRef.current < IO_AUTHORITY_MS
      ) {
        L('signal (poll ignored — recent IO authority)', {
          wantVisible,
          phase: phaseRef.current,
        });
        return;
      }

      wantVisibleRef.current = wantVisible;
      L('signal', { src, wantVisible, phase: phaseRef.current });

      if (tDebounceRef.current)
        window.clearTimeout(tDebounceRef.current);
      tDebounceRef.current = window.setTimeout(() => {
        const p = phaseRef.current;

        if (p === 'hidden' && wantVisible) {
          setPhase('entering', 'signal->enter');
          return;
        }

        if (p === 'entering') {
          if (!wantVisible) {
            pendingExitRef.current = true;
            L('queue exit (mid-enter)');
          }
          return;
        }

        if (p === 'shown' && !wantVisible) {
          if (since() >= MIN_SHOWN_DWELL_MS) {
            setPhase('exiting', 'signal->exit');
          } else {
            const wait = MIN_SHOWN_DWELL_MS - since();
            L('exit dwell delay', { waitMs: wait });
            window.setTimeout(() => {
              if (
                phaseRef.current === 'shown' &&
                !wantVisibleRef.current
              ) {
                setPhase('exiting', 'exit after dwell');
              } else {
                L('exit dwell aborted', {
                  phase: phaseRef.current,
                  stillNotWanted: !wantVisibleRef.current,
                });
              }
            }, wait);
          }
          return;
        }

        if (p === 'exiting' && wantVisible) {
          L('visible during exit (ignored)');
        }
      }, VISIBLE_DEBOUNCE_MS);
    },
    [
      setPhase,
    ],
  );

  // Called right after enter finishes if we already know it shouldn't be visible
  const requestExitIfAllowed = (why: string) => {
    pendingExitRef.current = false;
    if (phaseRef.current !== 'shown') {
      L('requestExitIfAllowed ignored (not shown)', {
        phase: phaseRef.current,
        why,
      });
      return;
    }
    if (!wantVisibleRef.current) {
      if (since() >= MIN_SHOWN_DWELL_MS) {
        setPhase('exiting', `requestExitIfAllowed: ${why}`);
      } else {
        const wait = MIN_SHOWN_DWELL_MS - since();
        L('requestExitIfAllowed dwell delay', { waitMs: wait, why });
        window.setTimeout(() => {
          if (
            phaseRef.current === 'shown' &&
            !wantVisibleRef.current
          ) {
            setPhase(
              'exiting',
              `requestExitIfAllowed after dwell: ${why}`,
            );
          } else {
            L('requestExitIfAllowed aborted', {
              phase: phaseRef.current,
              stillNotWanted: !wantVisibleRef.current,
            });
          }
        }, wait);
      }
    }
  };

  // --- IO + fallback ---------------------------------------------------------
  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) {
      L('NO TARGET', { watchId });
      return;
    }

    const io = new IntersectionObserver(
      ([
        entry,
      ]) => {
        const off = !entry.isIntersecting;
        lastIOSampleRef.current = performance.now();
        L('IO', {
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
          top: entry.boundingClientRect.top.toFixed(1),
          bottom: entry.boundingClientRect.bottom.toFixed(1),
          vh: window.innerHeight,
        });
        applySignal(off, 'IO');
      },
      { root: null, threshold: 0 },
    );
    io.observe(target);

    const poll = () => {
      const rect = target.getBoundingClientRect();
      const off = rect.bottom <= 0 || rect.top >= window.innerHeight;
      L('POLL', {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        vh: window.innerHeight,
        off,
      });
      applySignal(off, 'poll');
    };

    const onScrollOrResize = () => {
      if (scrollRafRef.current)
        cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(poll);
    };

    window.addEventListener('scroll', onScrollOrResize, {
      passive: true,
    });
    window.addEventListener('resize', onScrollOrResize);

    // Initial sample
    poll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (scrollRafRef.current)
        cancelAnimationFrame(scrollRafRef.current);
      if (tDebounceRef.current)
        window.clearTimeout(tDebounceRef.current);
      scrollRafRef.current = null;
      tDebounceRef.current = null;
    };
  }, [
    watchId,
    applySignal,
    L,
  ]);

  return (
    <div className={s.root}>
      <div className={s.rail}>
        <div
          ref={shuttleRef}
          className={clsx(s.shuttle)}
          data-phase={phase}
        >
          <div className={s.payload}>
            <Link
              href={href}
              className={clsx(s.button, className)}
              aria-label={label}
            >
              <span className={s.iconWrap}>
                <SendIcon
                  className={s.iconGlyph}
                  data-phase={phase}
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
