'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

import * as s from '@/styles/components/contactButton.css';
import SendIcon from '@/components/icons/SendIcon';
import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';

import {
  shuttleDurationMs,
  shuttleExitDurationMs,
  exitTranslationDelayMs,
} from '@/styles/components/contactButton.vars';
import { useElementOffscreen } from '@/lib/useElementOffscreen';
import { notProd } from '../lib/runtimeEnv';

type Phase = 'hidden' | 'entering' | 'shown' | 'exiting';

type ContactButtonProps = {
  watchId: string;
  label: string;
  className?: string;
  debugLog?: boolean;
};

export default function ContactButton({
  watchId,
  label,
  className,
  debugLog = false,
}: ContactButtonProps) {
  const [
    mounted,
    setMounted,
  ] = useState(false);
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const [
    phase,
    _setPhase,
  ] = useState<Phase>('hidden');
  const phaseRef = useRef<Phase>('hidden');
  const phaseSinceRef = useRef<number | null>(null);
  const shuttleRef = useRef<HTMLDivElement | null>(null);
  const linkRef = useRef<HTMLButtonElement | null>(null);

  const wantVisibleRef = useRef<boolean>(false);

  const enterFallbackRef = useRef<number | null>(null);
  const exitFallbackRef = useRef<number | null>(null);

  const MIN_SHOWN_DWELL_MS = 200;

  const T0 = useRef<number | null>(null);
  const nowMs = () =>
    T0.current == null
      ? 0
      : Math.round(performance.now() - T0.current);
  const since = () =>
    phaseSinceRef.current == null
      ? 0
      : Date.now() - phaseSinceRef.current;

  useEffect(() => {
    if (T0.current == null) {
      T0.current = performance.now();
    }
    if (phaseSinceRef.current == null) {
      phaseSinceRef.current = Date.now();
    }
  }, []);

  const enableDebug = debugLog && notProd();
  const L = useCallback(
    (...a: unknown[]) => {
      if (!enableDebug) return;
      console.log('[ContactButton]', `${nowMs()}ms`, ...a);
    },
    [
      enableDebug,
    ],
  );

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

  const offscreen = useElementOffscreen(watchId, {
    debounceMs: 0,
    mode: 'above',
  });

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
  useEffect(() => {
    wantVisibleRef.current = offscreen;

    const currentPhase = phaseRef.current;
    let enterTimeout: number | null = null;
    let exitTimeout: number | null = null;

    if (currentPhase === 'hidden' && offscreen) {
      L('→ signal enter (offscreen hook)');
      enterTimeout = window.setTimeout(() => {
        setPhase('entering', 'signal->enter');
      }, 0);
    }

    if (currentPhase === 'shown' && !offscreen) {
      L('→ signal exit (offscreen hook)');
      exitTimeout = window.setTimeout(() => {
        requestExitIfAllowed('signal->exit');
      }, 0);
    }

    return () => {
      if (enterTimeout !== null) {
        window.clearTimeout(enterTimeout);
      }
      if (exitTimeout !== null) {
        window.clearTimeout(exitTimeout);
      }
    };
  }, [
    offscreen,
    L,
    setPhase,
    requestExitIfAllowed,
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
            <ContactDialogTrigger
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
            </ContactDialogTrigger>
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(content, document.body) : null;
}
