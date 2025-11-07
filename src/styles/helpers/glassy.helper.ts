import { glassVars } from '@/tokens/glassy.tokens';
import type * as CSS from 'csstype';
import { noiseStyle, type NoiseSvgOptions } from './noiseSVG.helper';
import { buildLinear, type Built } from './gradients.helper';
import type { IBackgrounds } from './background.helper';
import { m } from '../measurementKit';
import { mPercent } from '../measurementKit/units/percent';

type GradientBuild = Built['modern'];

const defaultNoiseId = `${glassVars.noise.idPrefix}${Math.random()
  .toString(36)
  .slice(2, 10)}`;

export const glassNoise = (
  id: string = defaultNoiseId,
  props?: NoiseSvgOptions,
) => noiseStyle(id, props);

export const createGlassBackground = (): {
  backgrounds?: IBackgrounds;
  gradients: GradientBuild[];
  backgroundLayers: {
    overlay: string;
    glow: string;
  };
  backdropFilter: CSS.Property.BackdropFilter;
  WebkitBackdropFilter: CSS.Property.BackdropFilter;
} => {
  const overlayGradient = buildLinear({
    angle: glassVars.overlay.direction,
    stops: [
      {
        color: glassVars.overlay.color.alpha(
          glassVars.overlay.topAlpha,
        ),
        at: mPercent(0),
      },
      {
        color: glassVars.overlay.color.alpha(0),
        at: glassVars.overlay.midStop,
      },
      {
        color: glassVars.overlay.color.alpha(
          glassVars.overlay.bottomAlpha,
        ),
        at: mPercent(100),
      },
    ],
  }).modern;

  const glowGradient = buildLinear({
    angle: m(135, 'deg'),
    stops: [
      {
        color: glassVars.surfaceGlowPrimaryTint.alpha(
          glassVars.surfaceGlow.primaryTintAlpha,
        ),
        at: mPercent(0),
      },
      {
        color: glassVars.surfaceGlowSecondaryTint.alpha(
          glassVars.surfaceGlow.secondaryTintAlpha,
        ),
        at: mPercent(100),
      },
    ],
  }).modern;

  return {
    backgrounds: {
      color: glassVars.backgrounds.color,
    },
    backgroundLayers: {
      overlay: overlayGradient,
      glow: glowGradient,
    },
    gradients: [
      overlayGradient,
      glowGradient,
    ],
    backdropFilter: `blur(${glassVars.blur.css()})`,
    WebkitBackdropFilter:
      `blur(${glassVars.blur.css()})` as CSS.Property.BackdropFilter,
  };
};
