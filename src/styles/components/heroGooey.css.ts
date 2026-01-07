import { keyframes, style } from '@vanilla-extract/css';
import { fullSizeOfParent } from '../helpers/positioning.helper';

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

export const blobWrap = style({
  ...fullSizeOfParent(),
  overflow: 'visible',
  pointerEvents: 'none',
  opacity: 0,
  animation: `${fadeIn} 800ms ease-out 120ms forwards`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 1,
    },
  },
});

export const blobField = style({
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
});

export const blobGroup = style({});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

type WanderOptions = {
  delayPercent?: number;
  phaseDeg?: number;
};

type Amplitude = number | string;

const delayFromPercent = (
  durationSeconds: number,
  delayPercent: number,
) => `${((durationSeconds * delayPercent) / 100).toFixed(2)}s`;

const parseAmplitude = (input: Amplitude) => {
  if (typeof input === 'number') {
    return { value: input, unit: 'px' };
  }

  const match = input.trim().match(/^(-?\d*\.?\d+)([a-z%]+)$/);
  if (!match) {
    return { value: 0, unit: 'px' };
  }

  return { value: Number(match[1]), unit: match[2] };
};

const makeWanderKeyframes = (
  amplitudeX: Amplitude,
  amplitudeY: Amplitude,
  options: WanderOptions = {},
) => {
  const steps = 36;
  const frames: Record<string, { transform: string }> = {};
  const phase = ((options.phaseDeg ?? 0) * Math.PI) / 180;
  const parsedX = parseAmplitude(amplitudeX);
  const parsedY = parseAmplitude(amplitudeY);

  for (let i = 0; i <= steps; i += 1) {
    const progress = i / steps;
    const angle = progress * Math.PI * 2 + phase;
    const x = Math.cos(angle) * parsedX.value;
    const y = Math.sin(angle) * parsedY.value;
    const percent = `${(progress * 100).toFixed(2)}%`;

    frames[percent] = {
      transform: `translate(${x.toFixed(2)}${parsedX.unit}, ${y.toFixed(
        2,
      )}${parsedY.unit})`,
    };
  }

  return {
    keyframe: keyframes(frames),
    delayPercent: options.delayPercent ?? 0,
  };
};

const wanderADuration = 27;
const wanderBDuration = 39;

const wanderA = makeWanderKeyframes('1vw', '0.8vh', {
  phaseDeg: 195,
});
const wanderB = makeWanderKeyframes('1.6vw', '0.2vh', {
  // delayPercent: -10,
  phaseDeg: 295,
});

export const blobSpin = style({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

export const blobShape = style({
  mixBlendMode: 'normal',
  opacity: 1,
  transformBox: 'view-box',
  transformOrigin: '0 0',
});

export const spin_a_animation = style({
  animation: `${spin} 27s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const spin_b_animation = style({
  animation: `${spin} 37s linear infinite reverse`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const ellpitical_a_nimation = style({
  animation: `${wanderA.keyframe} ${wanderADuration}s linear ${delayFromPercent(
    wanderADuration,
    wanderA.delayPercent,
  )} infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const ellpitical_b_animation = style({
  animation: `${wanderB.keyframe} ${wanderBDuration}s linear ${delayFromPercent(
    wanderBDuration,
    wanderB.delayPercent,
  )} infinite reverse`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});
