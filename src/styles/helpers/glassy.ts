import { color } from './colorWrap';
import { m, mPercent } from '../measurementKit';
import type * as CSS from 'csstype';
import { noiseStyle, type NoiseSvgOptions } from './noiseSVG';
import { colorVars } from '../componentTokens/componentTokens.global';

const defaultNoiseId = `glassy-noise-${Math.random().toString(36).slice(2, 10)}`;

export const glassNoise = (
  id: string = defaultNoiseId,
  props?: NoiseSvgOptions,
) => noiseStyle(id, props);

export const glassVars = {
  backgroundColor: colorVars.white.alpha(0.06),
  surfaceGlowPrimaryTint: color('#0f0c18').alpha(0.5),
  surfaceGlowSecondaryTint: color('#0f0c18').alpha(0.14),
  innerBorderColor: colorVars.white,
  backdropBlur: m(5),
  border: {
    radius: m(40), // border Radius
    width: m(2),
  },
  // Kind of "background" color
  innerBorderHighlight: {
    radialStrength: 0.5,
    opacity: 1,
  },
  // Specular highlight in the top left corner
  outerBorderHighlight: {
    strength: 0.35,
    spread: mPercent(70),
    angle: m(130, 'deg'),
  },
  // Blur effect
  surfaceGlow: {
    blur: m(12),
    opacity: 0.5,
    primaryTintAlpha: 0.1,
    secondaryTintAlpha: 0.6,
  },
  // Slight gradient overlay
  overlay: {
    color: colorVars.black,
    topAlpha: 0.05,
    midStop: '45%',
    bottomAlpha: 0.1,
    direction: m(-45, 'deg'),
  },

  /** Shared noise texture for glass surfaces (uses a default id) */
  noiseDataUri: () => glassNoise(),
  /** Unique filter id embedded in the default noise texture */
  noiseFilterId: defaultNoiseId,
};

export const glossyBorder = {
  base: {
    // radius: glassVars.border.radius.add(glassVars.border.width),
    color: colorVars.transparent,
  },
};

export const createGlassBackground = (): {
  background: CSS.Property.Background<string>;
  backgroundLayers: {
    overlay: string;
    glow: string;
  };
  backgroundColor: CSS.Property.BackgroundColor;
  backdropFilter: CSS.Property.BackdropFilter;
  WebkitBackdropFilter: CSS.Property.BackdropFilter;
} => {
  const overlayGradient = `linear-gradient(${glassVars.overlay.direction.css()}, ${glassVars.overlay.color
    .alpha(glassVars.overlay.topAlpha)
    .css()}, ${glassVars.overlay.color.alpha(0).css()} ${glassVars.overlay.midStop}, ${glassVars.overlay.color
    .alpha(glassVars.overlay.bottomAlpha)
    .css()} 100%)`;
  const glowGradient = `linear-gradient(135deg, ${glassVars.surfaceGlowPrimaryTint.css()}, ${glassVars.surfaceGlowSecondaryTint.css()})`;
  const baseColor = glassVars.backgroundColor.css();
  return {
    backgroundLayers: {
      overlay: overlayGradient,
      glow: glowGradient,
    },
    background: [
      overlayGradient,
      glowGradient,
    ].join(', '),
    backgroundColor: baseColor,
    backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
    WebkitBackdropFilter:
      `blur(${glassVars.backdropBlur.css()})` as CSS.Property.BackdropFilter,
  };
};

export const glassyActionTokens = {
  size: m(44),
  borderRadius: m(12),
  borderWidth: m(0.75),
  borderColor: colorVars.white.alpha(0.28),
  background: colorVars.white.alpha(0.12),
  hoverBackground: colorVars.white.alpha(0.18),
  textColor: colorVars.white,
  shadowRest: `0 ${m(1.5).css()} ${m(6).css()} ${colorVars.black.alpha(0.35).css()}`,
  shadowHover: `0 ${m(2.5).css()} ${m(12).css()} ${colorVars.black.alpha(0.4).css()}`,
  transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
  focusRingWidth: m(1),
  focusRingColor: colorVars.white.alpha(0.45),
  iconSize: m(18),
} as const;
