'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import * as layoutStyles from '@/styles/layout.css';
import * as s from '@/styles/components/hero.css';
import VideoByName from './VideoByName';
import HeroHeading from './HeroHeading.client';
import { toTrimmedOrNull } from '@/lib/stringUtils';
import SendIcon from '@/components/icons/SendIcon';
import {
  collectWaitForFonts,
  waitForFonts,
} from '@/lib/fontLoading';
import {
  fontVars,
  projectorVars,
} from '@/styles/vars';

type HeroCopy = {
  videoTitle: string;
  videoLabel: string;
  headingFirstLine: string;
  headingLastLine: string;
  consoleDescription: string;
  videoErrorMessage: string;
  ctaLabel?: string;
};

type Props = {
  id?: string;
  className?: string;
  copy: HeroCopy;
  ctaHref?: string;
  withVideo?: boolean;
  overlayClassName?: string;
  headingAnimated?: boolean;
};

export default function Hero({
  id,
  className,
  copy,
  ctaHref,
  withVideo = true,
  overlayClassName,
  headingAnimated = true,
}: Props) {
  const [
    ctaReady,
    setCtaReady,
  ] = useState(false);
  const [
    waitingForReveal,
    setWaitingForReveal,
  ] = useState(false);

  const headingLabel = useMemo(
    () =>
      toTrimmedOrNull(
        `${copy.headingFirstLine} ${copy.headingLastLine}`,
      ),
    [copy.headingFirstLine, copy.headingLastLine],
  );
  const showVideo = withVideo;
  const showCta = Boolean(ctaHref && copy.ctaLabel);

  const headingKey = useMemo(
    () =>
      [
        headingLabel ?? '',
        copy.ctaLabel,
        headingAnimated ? 'animated' : 'static',
      ].join('|'),
    [headingAnimated, headingLabel, copy.ctaLabel],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    setCtaReady(false);
    setWaitingForReveal(true);

    const revealAfter = async () => {
      const { fonts, timeoutMs } = collectWaitForFonts(fontVars.hero);
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
      const revealDuration =
        projectorVars.timing.textReveal.duration;
      const totalDelay = headingAnimated
        ? calibration.add(revealOffset).add(revealDuration).add(projectorVars.cta.delay)
        : projectorVars.cta.delay;
      const delayMs = totalDelay.value;

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
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [
    headingAnimated,
    headingKey,
  ]);

  const handleHeadingReveal = useCallback(() => {
    if (!headingAnimated || !waitingForReveal) return;
    setCtaReady(true);
    setWaitingForReveal(false);
  }, [headingAnimated, waitingForReveal]);

  const ctaVisible = showCta && ctaReady;

  if (!headingLabel) return null;

  return (
    <section
      id={id}
      className={clsx(s.root, className)}
      data-heading-animated={headingAnimated ? 'true' : 'false'}
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

      {/* Banding-fix overlays (over video, under content) */}
      <div
        className={clsx(s.overlays, overlayClassName)}
        aria-hidden
      >
        <div className={s.grain} />
        <div className={s.wash} />
        <div className={s.centerSoften} />
        <div className={s.ringBreaker} />
      </div>

      <div className={clsx(layoutStyles.content, s.content)}>
        <div className={clsx(layoutStyles.panel, s.panel)}>
          <div className={s.bridge}>
            <HeroHeading
              label={headingLabel}
              animate={headingAnimated}
              onReveal={handleHeadingReveal}
              // debugStage="initial"
            >
              <span
                className={s.line}
                data-position="first"
                data-text={copy.headingFirstLine}
              >
                {copy.headingFirstLine}
              </span>
              <br className={s.title_break} />
              <span
                className={s.line}
                data-position="last"
                data-text={copy.headingLastLine}
              >
                {copy.headingLastLine}
              </span>
            </HeroHeading>
            {showCta ? (
              <Link
                className={s.cta}
                href={ctaHref!}
                data-ready={ctaVisible ? 'true' : 'false'}
                aria-hidden={ctaVisible ? undefined : 'true'}
                tabIndex={ctaVisible ? undefined : -1}
              >
                <span>{copy.ctaLabel}</span>
                <SendIcon className={s.ctaIcon} aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
