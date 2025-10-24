'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import clsx from 'clsx';

import * as s from '@/styles/components/contactButton.css';
import SendIcon from '@/components/icons/SendIcon';

import {
  shuttleDurationMs,
  shuttleExitDurationMs,
  exitTranslationDelayMs,
} from '@/styles/components/contactButton.vars';

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
    mounted,
    setMounted,
  ] = useState(false);
  useEffect(() => setMounted(true), []);

  const [
    phase,
    _setPhase,
  ] = useState<Phase>('hidden');
  const phaseRef = useRef<Phase>('hidden');
  const phaseSinceRef = useRef<number>(Date.now());
  const shuttleRef = useRef<HTMLDivElement | null>(null);
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  const tDebounceRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const wantVisibleRef = useRef<boolean>(false);

  const enterFallbackRef = useRef<number | null>(null);
  const exitFallbackRef = useRef<number | null>(null);

  const lastIOSampleRef = useRef<number>(0);
  const IO_AUTHORITY_MS = 300;
  const VISIBLE_DEBOUNCE_MS = 80;
  const MIN_SHOWN_DWELL_MS = 200;

  const T0 = useRef<number>(performance.now());
  const nowMs = () => Math.round(performance.now() - T0.current);
  const since = () => Date.now() - phaseSinceRef.current;

  const L = useCallback((...a: unknown[]) => {
    console.log('[ContactButton]', `${nowMs()}ms`, ...a);
  }, []);

  const setPhase = useCallback(
    (next: Phase, why?: string) => {
      if (next === phaseRef.current) return;
      const prev = phaseRef.current;
      phaseRef.current = next;
      _setPhase(next);
      const dt = since();
      phaseSinceRef.current = Date.now();
      L(`PHASE ${prev} -> ${next}${why ? `  (${why})` : ''}`, {
        dtFromPrevMs: dt,
      });
    },
    [
      L,
    ],
  );

  const requestExitIfAllowed = useCallback(
    (why: string) => {
      if (phaseRef.current !== 'shown') return;
      if (!wantVisibleRef.current) {
        if (since() >= MIN_SHOWN_DWELL_MS) {
          L('→ set exiting (allowed immediately)', { why });
          setPhase('exiting', `requestExitIfAllowed: ${why}`);
        } else {
          const wait = MIN_SHOWN_DWELL_MS - since();
          L('→ wait dwell then exit', { wait, why });
          window.setTimeout(() => {
            if (
              phaseRef.current === 'shown' &&
              !wantVisibleRef.current
            ) {
              L('→ dwell elapsed, set exiting', { why });
              setPhase(
                'exiting',
                `requestExitIfAllowed after dwell: ${why}`,
              );
            }
          }, wait);
        }
      }
    },
    [
      L,
      setPhase,
    ],
  );

  /* keep phase dataset on shuttle + button (for CSS-driven keyframes) */
  useEffect(() => {
    const el = shuttleRef.current;
    if (el) el.dataset.phase = phase;
    const btn = el?.querySelector('a');
    if (btn) (btn as HTMLElement).dataset.phase = phase;
  }, [
    phase,
  ]);

  /* Robust interactivity gating WITHOUT any-casts */
  useEffect(() => {
    const a = linkRef.current;
    if (!a) return;

    if (
      phase === 'exiting' ||
      phase === 'hidden' ||
      phase === 'entering'
    ) {
      a.setAttribute('inert', '');
      a.setAttribute('aria-disabled', 'true');
      // keep it out of tab order while not interactive
      a.tabIndex = -1;
    } else {
      a.removeAttribute('inert');
      a.removeAttribute('aria-disabled');
      // don't force a positive tabIndex; let DOM/default manage it
      a.removeAttribute('tabindex');
    }
  }, [
    phase,
  ]);

  /* CSS animationend primary path */
  useEffect(() => {
    const el = shuttleRef.current;
    if (!el) return;

    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.target !== el) return;
      L('animationend on shuttle', {
        phase: phaseRef.current,
        name: e.animationName, // typed; no any
      });
      if (phaseRef.current === 'entering') {
        setPhase('shown', 'enter finished');
        if (!wantVisibleRef.current)
          requestExitIfAllowed('post-enter check');
      } else if (phaseRef.current === 'exiting') {
        setPhase('hidden', 'exit finished');
      }
    };

    el.addEventListener('animationend', onAnimationEnd);
    return () => {
      el.removeEventListener('animationend', onAnimationEnd);
    };
  }, [
    setPhase,
    requestExitIfAllowed,
    L,
  ]);

  /* Fallback timers: ensure phase flips even if CSS events are lost */
  useEffect(() => {
    if (enterFallbackRef.current) {
      window.clearTimeout(enterFallbackRef.current);
      enterFallbackRef.current = null;
    }
    if (exitFallbackRef.current) {
      window.clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }

    if (phase === 'entering') {
      const ms = Number(shuttleDurationMs) + 40;
      L('fallback timer armed for entering→shown', { ms });
      enterFallbackRef.current = window.setTimeout(() => {
        if (phaseRef.current === 'entering') {
          L('fallback fired: forcing shown');
          setPhase('shown', 'enter fallback');
          if (!wantVisibleRef.current)
            requestExitIfAllowed('post-enter check (fallback)');
        }
      }, ms);
    }

    if (phase === 'exiting') {
      const ms =
        Number(exitTranslationDelayMs) +
        Number(shuttleExitDurationMs) +
        40;
      L('fallback timer armed for exiting→hidden', { ms });
      exitFallbackRef.current = window.setTimeout(() => {
        if (phaseRef.current === 'exiting') {
          L('fallback fired: forcing hidden');
          setPhase('hidden', 'exit fallback');
        }
      }, ms);
    }

    return () => {
      if (enterFallbackRef.current) {
        window.clearTimeout(enterFallbackRef.current);
        enterFallbackRef.current = null;
      }
      if (exitFallbackRef.current) {
        window.clearTimeout(exitFallbackRef.current);
        exitFallbackRef.current = null;
      }
    };
  }, [
    phase,
    setPhase,
    requestExitIfAllowed,
    L,
  ]);

  const applySignal = useCallback(
    (wantVisible: boolean, src: 'IO' | 'poll') => {
      if (
        src === 'poll' &&
        performance.now() - lastIOSampleRef.current < IO_AUTHORITY_MS
      )
        return;

      wantVisibleRef.current = wantVisible;
      L('applySignal', { src, wantVisible, phase: phaseRef.current });

      if (tDebounceRef.current)
        window.clearTimeout(tDebounceRef.current);
      tDebounceRef.current = window.setTimeout(() => {
        const p = phaseRef.current;
        if (p === 'hidden' && wantVisible) {
          L('→ signal enter');
          setPhase('entering', 'signal->enter');
        }
        if (p === 'shown' && !wantVisible) {
          L('→ signal exit (request)');
          requestExitIfAllowed('signal->exit');
        }
      }, VISIBLE_DEBOUNCE_MS);
    },
    [
      L,
      setPhase,
      requestExitIfAllowed,
    ],
  );

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;

    const io = new IntersectionObserver(
      ([
        entry,
      ]) => {
        const off = !entry.isIntersecting;
        lastIOSampleRef.current = performance.now();
        applySignal(off, 'IO');
      },
      { root: null, threshold: 0 },
    );
    io.observe(target);

    const poll = () => {
      const rect = target.getBoundingClientRect();
      const off = rect.bottom <= 0 || rect.top >= window.innerHeight;
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
    poll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (scrollRafRef.current)
        cancelAnimationFrame(scrollRafRef.current);
      if (tDebounceRef.current)
        window.clearTimeout(tDebounceRef.current);
      if (enterFallbackRef.current)
        window.clearTimeout(enterFallbackRef.current);
      if (exitFallbackRef.current)
        window.clearTimeout(exitFallbackRef.current);
      scrollRafRef.current = null;
      tDebounceRef.current = null;
      enterFallbackRef.current = null;
      exitFallbackRef.current = null;
    };
  }, [
    watchId,
    applySignal,
  ]);

  const exiting = phase === 'exiting';

  const content = (
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
              ref={linkRef}
              className={clsx(s.button, className)}
              aria-label={label}
              data-phase={phase}
              aria-disabled={exiting ? 'true' : undefined}
              style={exiting ? { pointerEvents: 'none' } : undefined}
              // extra guard for keyboard activation while exiting
              onKeyDown={(e) => {
                if (exiting && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                if (exiting) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <div className={clsx(s.gradient, s.gradientVisible)} />
              <div className={s.iconWrap}>
                <div className={s.iconShell}>
                  <div className={s.iconTrack} data-phase={phase}>
                    <SendIcon
                      className={s.iconGlyph}
                      data-phase={phase}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : null;
}
