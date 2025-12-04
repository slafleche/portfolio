import { glassVars } from '@/tokens/glassy.tokens';
import type { CSS_TYPES } from '@/styles/helpers/types.helper';
import type { BackdropFilterIntent } from './backdropFilter.helper';
import { noiseStyle, type NoiseSvgOptions } from './noiseSVG.helper';
import { buildLinear } from './gradients.helper';
import { m, mPercent } from 'css-calipers';

const defaultNoiseId = `${glassVars.noise.idPrefix}${Math.random()
  .toString(36)
  .slice(2, 10)}`;

export const glassNoise = (
  id: string = defaultNoiseId,
  props?: NoiseSvgOptions,
) => noiseStyle(id, props);

export const createGlassBackground = (): {
  backgroundLayers: {
    overlay: string;
    glow: string;
  };
  backgroundColorValue: CSS_TYPES.Property.BackgroundColor;
  backgroundImageValue: CSS_TYPES.Property.BackgroundImage;
  backdropFilterIntent: BackdropFilterIntent;
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

  const backgroundColorValue =
    glassVars.backgrounds.color.css() as CSS_TYPES.Property.BackgroundColor;
  const backgroundImageValue = [
    overlayGradient,
    glowGradient,
  ].join(', ') as CSS_TYPES.Property.BackgroundImage;

  return {
    backgroundLayers: {
      overlay: overlayGradient,
      glow: glowGradient,
    },
    backgroundColorValue,
    backgroundImageValue,
    backdropFilterIntent: {
      blur: glassVars.blur,
    },
  };
};
