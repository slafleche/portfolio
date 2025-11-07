import { glassVars } from '@/tokens/glassy.tokens';
import type * as CSS from 'csstype';
import { noiseStyle, type NoiseSvgOptions } from './noiseSVG.helper';
import { buildLinear } from './gradients.helper';

const defaultNoiseId = `${glassVars.noise.idPrefix}${Math.random()
  .toString(36)
  .slice(2, 10)}`;

export const glassNoise = (
  id: string = defaultNoiseId,
  props?: NoiseSvgOptions,
) => noiseStyle(id, props);

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
  const overlayGradient = buildLinear({
    angle: glassVars.overlay.direction,
    stops: [
      {
        color: glassVars.overlay.color.alpha(
          glassVars.overlay.topAlpha,
        ),
        at: 0,
      },
      {
        color: glassVars.overlay.color.alpha(0),
        at: glassVars.overlay.midStop,
      },
      {
        color: glassVars.overlay.color.alpha(
          glassVars.overlay.bottomAlpha,
        ),
        at: 100,
      },
    ],
  }).modern;

  const glowGradient = buildLinear({
    angle: 135,
    stops: [
      {
        color: glassVars.surfaceGlowPrimaryTint.alpha(
          glassVars.surfaceGlow.primaryTintAlpha,
        ),
        at: 0,
      },
      {
        color: glassVars.surfaceGlowSecondaryTint.alpha(
          glassVars.surfaceGlow.secondaryTintAlpha,
        ),
        at: 100,
      },
    ],
  }).modern;

  return {
    backgroundLayers: {
      overlay: overlayGradient,
      glow: glowGradient,
    },
    background: [
      overlayGradient,
      glowGradient,
    ].join(', '),
    backgroundColor: glassVars.backgroundColor.css(),
    backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
    WebkitBackdropFilter:
      `blur(${glassVars.backdropBlur.css()})` as CSS.Property.BackdropFilter,
  };
};
