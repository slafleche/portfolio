import { m, mPercent } from 'css-calipers';

import { color } from '../styles/helpers/colorWrap.helper';
import { colorVars } from './global.tokens';

/**
 * Shared glass tokens (data only). Helper layer is responsible for
 * turning these into CSS strings / gradients.
 */
export const glassVars = {
  backdropFilter: {
    blur: m(4),
    saturate: mPercent(200),
    contrast: mPercent(110),
    brightness: mPercent(110),
  },
  backgrounds: {
    color: colorVars.white.alpha(0.08),
  },
  surfaceGlowPrimaryTint: color('#0f0c18').alpha(0.5),
  surfaceGlowSecondaryTint: color('#0f0c18').alpha(0.14),
  innerBorderColor: colorVars.white,

  borders: {
    radius: m(18),
    width: m(2),
  },

  surfaceGlow: {
    opacity: 0.5,
    primaryTintAlpha: 0.1,
    secondaryTintAlpha: 0.6,
  },

  overlay: {
    color: colorVars.black,
    topAlpha: 0.05,
    midStop: mPercent(45),
    bottomAlpha: 0.1,
    direction: m(-45, 'deg'),
  },

  noise: {
    idPrefix: 'glassy-noise-',
  },
  glassyLinks: {
    gap: m(40),
    size: m(100),
    hoverFocus: {
      scale: 1.2,
    },
  },
} as const;

export type GlassSurfaceTokens = typeof glassVars;

export const glassyButtonTokens = {
  size: m(44),
  iconSize: m(18),
  blur: m(5),
  backgrounds: {
    color: colorVars.white.alpha(0.12),
  },
  text: {
    color: colorVars.white,
  },
  borders: {
    radius: m(12),
    width: m(0.75),
    color: colorVars.white.alpha(0.28),
  },
  boxShadows: {
    x: m(0),
    y: m(1.5),
    blur: m(6),
    color: colorVars.black,
    alpha: 0.35,
  },
  outlines: {
    width: m(1),
    style: 'solid',
    color: colorVars.white.alpha(0.45),
  },
  hover: {
    backgrounds: {
      color: colorVars.white.alpha(0.16),
    },
    boxShadows: {
      x: m(0),
      y: m(2.5),
      blur: m(12),
      color: colorVars.black,
      alpha: 0.4,
    },
  },
  focus: {
    backgrounds: {
      color: colorVars.white.alpha(0.16),
    },
    boxShadows: {
      x: m(0),
      y: m(2.5),
      blur: m(12),
      color: colorVars.black,
      alpha: 0.4,
    },
  },
  focusVisible: {
    backgrounds: {
      color: colorVars.white.alpha(0.16),
    },
    boxShadows: {
      x: m(0),
      y: m(2.5),
      blur: m(12),
      color: colorVars.black,
      alpha: 0.4,
    },
  },
  active: {
    boxShadows: {
      x: m(0),
      y: m(1.5),
      blur: m(6),
      color: colorVars.black,
      alpha: 0.35,
    },
  },
  sheen: {
    gradients: {
      angle: m(135, 'deg'),
      stops: [
        { color: colorVars.white.alpha(0), at: mPercent(0) },
        { color: colorVars.white.alpha(0.65), at: mPercent(45) },
        { color: colorVars.white.alpha(0), at: mPercent(100) },
      ],
      inset: mPercent(-25),
      animationMs: m(520, 'ms'),
    },
  },
} as const;

export const glassyPanelTokens = {
  backgrounds: {
    color: colorVars.white.alpha(0.08),
  },
  borders: {
    radius: m(18),
    width: m(0.75),
    color: colorVars.white.alpha(0.16),
  },
  shadow: {
    x: m(0),
    y: m(3),
    blur: m(18),
    color: colorVars.black,
    alpha: 0.38,
  },
} as const;

export type GlassyPanelTokens = typeof glassyPanelTokens;
