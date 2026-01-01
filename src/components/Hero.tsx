'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react';
import clsx from 'clsx';
import * as layoutStyles from '@/styles/layout.css';
import * as s from '@/styles/components/hero.css';
import VideoByName from './VideoByName';
import HeroHeading from './HeroHeading.client';
import { toTrimmedOrNull } from '@/lib/stringUtils';
import { parseSplit } from '@/lib/locales/translations/splitShortcodes';
import SendIcon from '@/components/icons/SendIcon';
import { collectWaitForFonts, waitForFonts } from '@/lib/fontLoading';
import { heroVars } from '../styles/componentTokens/hero.componentTokens';
import { projectorVars } from '../styles/componentTokens/projector.componentTokens';
import { usePrefersReducedMotion } from '@/lib/accessibility/usePrefersReducedMotion';
import ImageByName from './ImageByName';
import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import { Markdown } from '@/components/Markdown';
import { userContent } from '@/styles/typography.css';
import { GlassPanel } from './GlassPanel';
import { heroFontVariants } from '../tokens/fontVariants/hero';
import HeroGooey from './HeroGooey';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import HeroWaypoint from './HeroWaypoint';

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
  withVideo = true,
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
  const showVideo = withVideo && !prefersReducedMotion;
  const showPoster = withVideo && prefersReducedMotion;
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
        {showVideo ? (
          <VideoByName
            name="hero"
            title={copy.videoTitle}
            label={copy.videoLabel}
            kind="hero"
            className={s.video}
            contentWrapClassName={s.contentWrap}
            visualItemClassName={s.visualContent}
            backgroundClassName={s.videoBg}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            role="presentation"
            errorMessage={copy.videoErrorMessage}
            fallbackLabel={copy.videoLabel}
          />
        ) : null}
        {showPoster ? (
          <div className={s.video} aria-hidden>
            <div className={s.videoBg} />
            <div className={s.contentWrap}>
              <ImageByName
                name="video-hero"
                alt={copy.videoDescription}
                size="lg"
                className={s.visualContent}
                priority
              />
            </div>
          </div>
        ) : null}

        {/* Banding-fix overlays (over video, under content) */}
        <div
          className={clsx(s.overlays, overlayClassName)}
          aria-hidden
        >
          <div className={s.grain} />
          <div className={s.wash} />
          <div className={s.centerSoften} />
          <div className={s.ringBreaker} />
          {Gooey && <Gooey style={gooeyStyle} />}
        </div>

        <div className={clsx(layoutStyles.content, s.content)}>
          <div className={clsx(layoutStyles.panel, s.panel)}>
            <div className={s.glassWrap}>
              <GlassPanel contentClassName={s.main}>
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
                    <Markdown
                      source={copy.subtitle}
                      className={userContent}
                    />
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
