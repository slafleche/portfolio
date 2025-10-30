/**
 * @deprecated This file is deprecated and will be removed in a future
 *   version. Please use 'projector.js' instead.
 */

import { m } from '../helpers/measurement';

export type Channel = 'blue' | 'green' | 'red';

/**
 * @deprecated Use projector.vars.ts for new animation work. This file
 *   remains as a historical reference while the animation data model
 *   transitions to the projector schema.
 */
/* Hero text-specific breakpoints (tied to layout, not devices) */
export const heroTextBreakpoints = {
  maxWidth: m(780),
  snugWidth: m(640),
};

/* Unit-bearing constants (defaults to px unless specified) */
export const offsetXMobile = m(6);
export const offsetYMobile = m(4.5);
export const blurStartMobile = m(3);

export const offsetXTablet = m(10);
export const offsetYTablet = m(7);
export const blurStartTablet = m(4);

export const offsetXDesktop = m(12);
export const offsetYDesktop = m(9);
export const blurStartDesktop = m(5);

export const totalDuration = m(4600, 'ms');

/* Hero text animation vars (no behavior) */
export const heroTextVars = {
  viewportTiers: {
    mobile: {
      offsetX: offsetXMobile,
      offsetY: offsetYMobile,
      blurStart: blurStartMobile,
    },
    tablet: {
      offsetX: offsetXTablet,
      offsetY: offsetYTablet,
      blurStart: blurStartTablet,
    },
    desktop: {
      offsetX: offsetXDesktop,
      offsetY: offsetYDesktop,
      blurStart: blurStartDesktop,
    },
  },

  timings: {
    totalDuration,
    segments: {
      establish: { start: m(0, 'ms'), end: m(300, 'ms') },
      drift: { start: m(300, 'ms'), end: m(900, 'ms') },
      converge: { start: m(900, 'ms'), end: m(2500, 'ms') },
      whiteReveal: { start: m(2100, 'ms'), end: m(2600, 'ms') },
      background: { start: m(2500, 'ms'), end: m(4000, 'ms') },
      settle: { start: m(4000, 'ms'), end: m(4600, 'ms') },
    },
  },

  microSteps: [],

  paths: {
    blue: [
      { time: m(0, 'ms'), x: -1.05, y: -1.65 },
      { time: m(600, 'ms'), x: -0.85, y: -1.25 },
      { time: m(1200, 'ms'), x: -0.58, y: -0.85 },
      { time: m(1800, 'ms'), x: -0.28, y: -0.36 },
      { time: m(2200, 'ms'), x: -0.12, y: -0.14 },
      { time: m(2500, 'ms'), x: 0, y: 0 },
    ],
    green: [
      { time: m(0, 'ms'), x: 0.95, y: 1.4 },
      { time: m(700, 'ms'), x: 0.78, y: 1.05 },
      { time: m(1350, 'ms'), x: 0.46, y: 0.62 },
      { time: m(1900, 'ms'), x: 0.22, y: 0.24 },
      { time: m(2300, 'ms'), x: 0.09, y: 0.1 },
      { time: m(2530, 'ms'), x: 0, y: 0 },
    ],
    red: [
      { time: m(0, 'ms'), x: 1.3, y: -1.5 },
      { time: m(750, 'ms'), x: 1.05, y: -1.1 },
      { time: m(1400, 'ms'), x: 0.6, y: -0.65 },
      { time: m(2000, 'ms'), x: 0.26, y: -0.28 },
      { time: m(2350, 'ms'), x: 0.08, y: -0.1 },
      { time: m(2560, 'ms'), x: 0, y: 0 },
    ],
  },

  blurSeries: {
    blue: [
      { time: m(0, 'ms'), value: m(5.1) },
      { time: m(800, 'ms'), value: m(4.7) },
      { time: m(1500, 'ms'), value: m(5.6) },
      { time: m(2100, 'ms'), value: m(3.9) },
      { time: m(2500, 'ms'), value: m(0) },
    ],
    green: [
      { time: m(0, 'ms'), value: m(5) },
      { time: m(900, 'ms'), value: m(5.6) },
      { time: m(1700, 'ms'), value: m(4.4) },
      { time: m(2300, 'ms'), value: m(4.8) },
      { time: m(2530, 'ms'), value: m(0) },
    ],
    red: [
      { time: m(0, 'ms'), value: m(5.5) },
      { time: m(1000, 'ms'), value: m(6.2) },
      { time: m(1800, 'ms'), value: m(4.7) },
      { time: m(2350, 'ms'), value: m(5.1) },
      { time: m(2560, 'ms'), value: m(0) },
    ],
  },

  /* Converge windows and easing */
  converge: {
    order: [
      'blue',
      'green',
      'red',
    ] as Channel[],
    easing: 'outExpo',
    blurEnd: m(0),
    opacityDip: {
      time: m(2100, 'ms'),
      to: 0.7,
      returnAt: m(2220, 'ms'),
    },
    windows: {
      blue: { start: m(900, 'ms'), end: m(2500, 'ms') },
      green: { start: m(930, 'ms'), end: m(2530, 'ms') },
      red: { start: m(960, 'ms'), end: m(2560, 'ms') },
    },
  },

  /* Subtle per-channel scale (color layers only) */
  channelScale: {
    blue: {
      start: 1.01,
      end: 1,
      startMs: m(900, 'ms'),
      endMs: m(2900, 'ms'),
      easing: 'outExpo',
    },
    green: {
      start: 1.008,
      end: 1,
      startMs: m(930, 'ms'),
      endMs: m(2930, 'ms'),
      easing: 'outExpo',
    },
    red: {
      start: 1.012,
      end: 1,
      startMs: m(960, 'ms'),
      endMs: m(2960, 'ms'),
      easing: 'outExpo',
    },
  },

  /* White reveal and optional micro-pulse */
  whiteReveal: {
    fade: {
      start: m(3200, 'ms'),
      end: m(4000, 'ms'),
      easing: 'outQuad',
    },
    pulse: {
      start: m(4000, 'ms'),
      end: m(4040, 'ms'),
      brightnessBoost: 0.02,
    },
  },

  /* Charcoal background fade window */
  backgroundFade: {
    start: m(2900, 'ms'),
    end: m(4400, 'ms'),
    easing: 'outQuad',
  },

  /* Final settle */
  settle: {
    masterScale: {
      from: 1.003,
      to: 1,
      start: m(4400, 'ms'),
      end: m(5000, 'ms'),
      easing: 'outCubic',
    },
    ghostFade: {
      from: 0.85,
      to: 0,
      start: m(3200, 'ms'),
      end: m(4500, 'ms'),
    },
  },
} as const;
