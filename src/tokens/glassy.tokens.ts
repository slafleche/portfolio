import { color } from '../styles/helpers/colorWrap.helper';
import { m, mPercent } from '../styles/measurementKit';
import { colorVars } from '../styles/componentTokens/global.componentTokens';

/**
 * Shared glass tokens (data only). Helper layer is responsible for
 * turning these into CSS strings / gradients.
 */
export const glassVars = {
  backgroundColor: colorVars.white.alpha(0.06),
  surfaceGlowPrimaryTint: color('#0f0c18').alpha(0.5),
  surfaceGlowSecondaryTint: color('#0f0c18').alpha(0.14),
  innerBorderColor: colorVars.white,
  backdropBlur: m(5),
  borders: {
    radius: m(40),
    width: m(2),
  },
  paddings: {
    all: m(2),
  },
  innerBorderHighlight: {
    radialStrength: 0.5,
    opacity: 1,
  },
  outerBorderHighlight: {
    strength: 0.35,
    spread: mPercent(70),
    angle: m(130, 'deg'),
  },
  surfaceGlow: {
    blur: m(12),
    opacity: 0.5,
    primaryTintAlpha: 0.1,
    secondaryTintAlpha: 0.6,
  },
  overlay: {
    color: colorVars.black,
    topAlpha: 0.05,
    midStop: '45%',
    bottomAlpha: 0.1,
    direction: m(-45, 'deg'),
  },
  noise: {
    idPrefix: 'glassy-noise-',
  },
} as const;

export type GlassSurfaceTokens = typeof glassVars;

export const glassyButtonTokens = {
  size: m(44),
  background: colorVars.white.alpha(0.12),
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
  hover: {
    background: {
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
    background: {
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
  transition:
    'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
  focusRingWidth: m(1),
  focusRingColor: colorVars.white.alpha(0.45),
  iconSize: m(18),
} as const;

export const glassyPanelTokens = {
  backgroundColor: colorVars.white.alpha(0.08),
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
