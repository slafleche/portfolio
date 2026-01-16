'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

import * as s from '@/styles/components/heroBg.css';
import * as nt from '@/styles/components/nubbyTriangle.css';
import * as rt from '@/styles/components/roundedTriangle.css';

import { usePrefersReducedMotion } from '../lib/accessibility/usePrefersReducedMotion';
import NubbyTriangle from './icons/NubbyTriangle';
import RoundedTriangle from './icons/RoundedTriangle';

type Props = {
  className?: string;
};

type RotationRange = {
  minRatio: number;
  maxRatio: number;
  minAngle: number;
  maxAngle: number;
};

type TranslationRange = {
  maxXPercent: number;
  maxYPercent: number;
};

const roundedRotationRange: RotationRange = {
  minRatio: 0.8,
  maxRatio: 1.2,
  minAngle: 90,
  maxAngle: 0,
};
const roundedTranslationRange: TranslationRange = {
  maxXPercent: 80,
  maxYPercent: 20,
};
const roundedSpinDurationSeconds = 57;
const roundedTranslateXSeconds = 37;
const roundedTranslateYSeconds = 29;

const nubbyRotationRange: RotationRange = {
  minRatio: 0.8,
  maxRatio: 1.2,
  minAngle: 0,
  maxAngle: -90,
};
const nubbyTranslationRange: TranslationRange = {
  maxXPercent: 45,
  maxYPercent: -30,
};
const nubbySpinDurationSeconds = 39;
const nubbyTranslateXSeconds = 37;
const nubbyTranslateYSeconds = 29;

const clampValue = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const getAngleForRatio = (ratio: number, range: RotationRange) => {
  const rangeSpan = range.maxRatio - range.minRatio;
  const normalized =
    rangeSpan === 0 ? 0 : (ratio - range.minRatio) / rangeSpan;
  const clamped = clampValue(normalized, 0, 1);
  const angle =
    range.minAngle + (range.maxAngle - range.minAngle) * clamped;
  const rounded = Math.round(angle * 100) / 100;

  return `${rounded}deg`;
};

const getLoopValue = (elapsedMs: number, durationSeconds: number) => {
  const durationMs = durationSeconds * 1000;
  if (durationMs === 0) {
    return 0;
  }
  const phase = (elapsedMs % durationMs) / durationMs;
  return 0.5 - Math.cos(phase * Math.PI * 2) * 0.5;
};

export default function HeroHomeBg({ className }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [
    hasInitialRotation,
    setHasInitialRotation,
  ] = useState(false);
  const [
    rotations,
    setRotations,
  ] = useState({
    rounded: '0deg',
    nubby: '0deg',
  });
  const [
    translations,
    setTranslations,
  ] = useState({
    rounded: 'translate3d(0, 0, 0)',
    nubby: 'translate3d(0, 0, 0)',
  });
  const [
    spins,
    setSpins,
  ] = useState({
    rounded: 'rotate(0deg)',
    nubby: 'rotate(0deg)',
  });
  const translateRangesRef = useRef({
    rounded: {
      translateX: roundedTranslationRange.maxXPercent,
      translateY: roundedTranslationRange.maxYPercent,
    },
    nubby: {
      translateX: nubbyTranslationRange.maxXPercent,
      translateY: nubbyTranslationRange.maxYPercent,
    },
  });

  useEffect(() => {
    let frameId: number | null = null;
    let motionFrameId: number | null = null;

    const updateRotation = () => {
      const ratio = window.innerWidth / window.innerHeight;
      setRotations({
        rounded: getAngleForRatio(ratio, roundedRotationRange),
        nubby: getAngleForRatio(ratio, nubbyRotationRange),
      });
      setHasInitialRotation(true);
    };

    const handleResize = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      frameId = window.requestAnimationFrame(updateRotation);
    };

    updateRotation();
    if (prefersReducedMotion) {
      setTranslations({
        rounded: 'translate3d(0, 0, 0)',
        nubby: 'translate3d(0, 0, 0)',
      });
      setSpins({
        rounded: 'rotate(0deg)',
        nubby: 'rotate(0deg)',
      });
      return () => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.removeEventListener('focus', updateRotation);
        document.removeEventListener(
          'visibilitychange',
          updateRotation,
        );
      };
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('focus', updateRotation);
    document.addEventListener('visibilitychange', updateRotation);
    const motionStart = performance.now();
    const tickMotion = (now: number) => {
      const elapsedMs = now - motionStart;
      const roundedPhaseX = getLoopValue(
        elapsedMs,
        roundedTranslateXSeconds,
      );
      const roundedPhaseY = getLoopValue(
        elapsedMs,
        roundedTranslateYSeconds,
      );
      const nubbyPhaseX = getLoopValue(
        elapsedMs,
        nubbyTranslateXSeconds,
      );
      const nubbyPhaseY = getLoopValue(
        elapsedMs,
        nubbyTranslateYSeconds,
      );
      const roundedSpinPhase =
        (elapsedMs % (roundedSpinDurationSeconds * 1000)) /
        (roundedSpinDurationSeconds * 1000);
      const nubbySpinPhase =
        (elapsedMs % (nubbySpinDurationSeconds * 1000)) /
        (nubbySpinDurationSeconds * 1000);
      const { rounded, nubby } = translateRangesRef.current;
      const roundedX = rounded.translateX * roundedPhaseX;
      const roundedY = rounded.translateY * roundedPhaseY;
      const nubbyX = nubby.translateX * nubbyPhaseX;
      const nubbyY = nubby.translateY * nubbyPhaseY;
      const roundedSpin = roundedSpinPhase * 360;
      const nubbySpin = nubbySpinPhase * -360;

      setTranslations({
        rounded: `translate3d(${roundedX}%, ${roundedY}%, 0)`,
        nubby: `translate3d(${nubbyX}%, ${nubbyY}%, 0)`,
      });
      setSpins({
        rounded: `rotate(${roundedSpin}deg)`,
        nubby: `rotate(${nubbySpin}deg)`,
      });
      motionFrameId = window.requestAnimationFrame(tickMotion);
    };
    motionFrameId = window.requestAnimationFrame(tickMotion);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      if (motionFrameId !== null) {
        window.cancelAnimationFrame(motionFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('focus', updateRotation);
      document.removeEventListener(
        'visibilitychange',
        updateRotation,
      );
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={clsx(s.root, className)}
      style={{ opacity: hasInitialRotation ? 1 : 0 }}
    >
      <div className={clsx(s.transformOrigin, rt.wrapper)}>
        <div
          style={{ transform: `rotate(${rotations.rounded})` }}
          className={s.transformOrigin}
        >
          <div
            className={s.transformOrigin}
            style={{ transform: translations.rounded }}
          >
            <div
              className={s.transformOrigin}
              style={{ transform: spins.rounded }}
            >
              <RoundedTriangle className={s.transformOrigin} />
            </div>
          </div>
        </div>
      </div>
      <div className={clsx(s.transformOrigin, nt.wrapper)}>
        <div
          style={{ transform: `rotate(${rotations.nubby})` }}
          className={s.transformOrigin}
        >
          <div
            className={s.transformOrigin}
            style={{ transform: translations.nubby }}
          >
            <div
              className={s.transformOrigin}
              style={{ transform: spins.nubby }}
            >
              <NubbyTriangle className={s.transformOrigin} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
