'use client';

import clsx from 'clsx';
import {
  type ComponentType,
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import SendIcon from '@/components/icons/SendIcon';
import { usePrefersReducedMotion } from '@/lib/accessibility/usePrefersReducedMotion';
import { collectWaitForFonts, waitForFonts } from '@/lib/fontLoading';
import { parseSplit } from '@/lib/locales/translations/splitShortcodes';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { toTrimmedOrNull } from '@/lib/stringUtils';
import * as s from '@/styles/components/hero.css';
import * as layoutStyles from '@/styles/layout.css';

import { heroVars } from '../styles/componentTokens/hero.component.tokens';
import { projectorVars } from '../styles/componentTokens/projector.component.tokens';
import { heroFontVariants } from '../tokens/fontVariants/hero';
import { GlassPanel } from './GlassPanel';
import HeroGooey from './HeroGooey';
import HeroHeading from './HeroHeading.client';
import HeroWaypoint from './HeroWaypoint';
// import VideoByName from './VideoByName';

type HeroCopy = {
  videoTitle: string;
  videoLabel: string;
  videoDescription: string;
  title: string;
  consoleDescription: string;
  videoErrorMessage: string;
  ctaLabel?: string;
  subtitle?: string;
};

type Props = {
  id?: string;
  className?: string;
  copy: HeroCopy;
  withVideo?: boolean;
  overlayClassName?: string;
  headingAnimated?: boolean;
  Gooey?: ComponentType<{ style?: CSSProperties }> | null;
};

export default function Hero({
  id,
  className,
  copy,
  overlayClassName,
  headingAnimated = true,
  Gooey = HeroGooey,
}: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isHeadingAnimated = headingAnimated && !prefersReducedMotion;
  const [
    ctaReady,
    setCtaReady,
  ] = useState(false);
  const [
    waitingForReveal,
    setWaitingForReveal,
  ] = useState(false);
  const revealDeadlineRef = useRef<number | null>(null);
  const { layoutTick } = useWindowSize();

  const { first: headingFirstLine, second: headingLastLine } =
    useMemo(
      () => parseSplit(copy.title),
      [
        copy.title,
      ],
    );

  const headingLabel = useMemo(
    () => toTrimmedOrNull(`${headingFirstLine} ${headingLastLine}`),
    [
      headingFirstLine,
      headingLastLine,
    ],
  );
  // const showVideo = withVideo && !prefersReducedMotion;
  // const showPoster = withVideo && prefersReducedMotion;
  const showCta = Boolean(copy.ctaLabel);

  const headingKey = useMemo(
    () =>
      [
        headingLabel ?? '',
        copy.ctaLabel,
        isHeadingAnimated ? 'animated' : 'static',
      ].join('|'),
    [
      isHeadingAnimated,
      headingLabel,
      copy.ctaLabel,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    let frameId: number | null = null;

    const setHeroCtaState = (ready: boolean, waiting: boolean) => {
      frameId = requestAnimationFrame(() => {
        if (cancelled) return;
        setCtaReady(ready);
        setWaitingForReveal(waiting);
      });
    };

    if (prefersReducedMotion) {
      setHeroCtaState(true, false);
      return () => {
        cancelled = true;
        if (timer !== null) {
          window.clearTimeout(timer);
        }
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    setHeroCtaState(false, true);

    const revealAfter = async () => {
      const { fonts, timeoutMs } = collectWaitForFonts(
        heroFontVariants.hero,
        heroVars.fontLoading,
      );
      if (fonts.length > 0) {
        try {
          await waitForFonts(fonts, { timeoutMs });
        } catch {
          // ignore timeout; proceed anyway
        }
      }
      if (cancelled) return;

      const calibration =
        projectorVars.timing.calibration.totalCalibrationTime;
      const revealOffset =
        projectorVars.timing.textReveal.offsetFromCalibrationEnd;
      const revealDuration = projectorVars.timing.textReveal.duration;
      const totalDelay = isHeadingAnimated
        ? calibration
            .add(revealOffset)
            .add(revealDuration)
            .add(projectorVars.cta.delay)
        : projectorVars.cta.delay;
      const delayMs = totalDelay.getValue();
      revealDeadlineRef.current = Date.now() + delayMs + 500;

      if (typeof window !== 'undefined') {
        timer = window.setTimeout(() => {
          if (!cancelled) {
            setCtaReady(true);
            setWaitingForReveal(false);
          }
        }, delayMs);
      } else {
        setCtaReady(true);
        setWaitingForReveal(false);
      }
    };

    revealAfter().catch(() => {
      if (!cancelled) {
        setCtaReady(true);
        setWaitingForReveal(false);
      }
    });

    return () => {
      cancelled = true;
      revealDeadlineRef.current = null;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [
    isHeadingAnimated,
    headingKey,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    if (ctaReady || !waitingForReveal) return;
    const deadline = revealDeadlineRef.current;
    if (!deadline) return;
    if (Date.now() < deadline) return;
    const frameId = requestAnimationFrame(() => {
      setCtaReady(true);
      setWaitingForReveal(false);
    });
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    ctaReady,
    waitingForReveal,
    layoutTick,
  ]);

  const handleHeadingReveal = useCallback(() => {
    if (!isHeadingAnimated || !waitingForReveal) return;
    setCtaReady(true);
    setWaitingForReveal(false);
  }, [
    isHeadingAnimated,
    waitingForReveal,
  ]);

  const ctaVisible = showCta && ctaReady;
  const gooeyStyle = {
    opacity: ctaReady ? 1 : 0,
    transition: prefersReducedMotion
      ? 'none'
      : 'opacity 100ms ease-in',
    transitionDelay: prefersReducedMotion ? '0ms' : '220ms',
  };

  if (!headingLabel) return null;

  return (
    <>
      <section
        id={id}
        className={clsx(s.root, className)}
        data-heading-animated={isHeadingAnimated ? 'true' : 'false'}
      >
        <div
          className={clsx(s.overlays, overlayClassName)}
          aria-hidden
        >
          <div className={s.fullGradient} />
          {Gooey && <Gooey style={gooeyStyle} />}
        </div>

        <div className={s.content}>
          <div className={clsx(layoutStyles.panel, s.panel)}>
            <div className={s.glassWrap}>
              <GlassPanel
                contentClassName={s.main}
                surfaceClassNameOverride={s.glassySurfaceOverwrite}
              >
                <HeroHeading
                  label={headingLabel}
                  animate={isHeadingAnimated}
                  onReveal={handleHeadingReveal}
                >
                  <span
                    className={s.line}
                    data-position={
                      headingLastLine ? 'first' : 'single'
                    }
                    data-text={headingFirstLine}
                  >
                    {headingFirstLine}
                  </span>
                  {headingLastLine ? (
                    <>
                      <br className={s.title_break} />
                      <span
                        className={s.line}
                        data-position="last"
                        data-text={headingLastLine}
                      >
                        {headingLastLine}
                      </span>
                    </>
                  ) : null}
                </HeroHeading>
                {copy.subtitle ? (
                  <div
                    className={s.subtitle}
                    data-ready={ctaVisible ? 'true' : 'false'}
                  >
                    <p className={s.subtitleMarkdown}>
                      {copy.subtitle}
                    </p>
                  </div>
                ) : null}
                {showCta ? (
                  <ContactDialogTrigger
                    className={s.cta}
                    data-ready={ctaVisible ? 'true' : 'false'}
                    aria-hidden={ctaVisible ? undefined : 'true'}
                    tabIndex={ctaVisible ? undefined : -1}
                  >
                    <span>{copy.ctaLabel}</span>
                    <SendIcon className={s.ctaIcon} aria-hidden />
                  </ContactDialogTrigger>
                ) : null}
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>
      <HeroWaypoint />
    </>
  );
}
