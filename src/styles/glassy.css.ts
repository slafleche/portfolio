import { style } from '@vanilla-extract/css';
import {
  createGlassBackground,
  glassNoise,
} from './helpers/glassy.helper';
import { glassVars } from '../tokens/glassy.tokens';
import { globalDropShadowFilter } from './helpers/shadow.helper';
import { noiseBg } from './helpers/noiseSVG.helper';
import borders from './helpers/borders.helper';
import backdropFilters from './helpers/backdropFilter.helper';

const glassBackground = createGlassBackground();
const innerRadius = glassVars.borders.radius.subtract(
  glassVars.borders.width,
);
// const innerMostRadius = `calc(${glassVars.border.width.css()} - ${glassVars.border.width.double.css()})`;

/**
 * Named layers for the default glass surface. Panels can reuse or
 * replace these strings to swap in alternative themes without
 * reverse-engineering gradients.
 */

const baseSurfaceBackground = {
  backgroundColor: glassBackground.backgroundColorValue,
  backgroundImage: glassBackground.backgroundImageValue,
} as const;

const glassSurface = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  ...baseSurfaceBackground,
  ...backdropFilters.style(glassBackground.backdropFilterIntent),
});

export const bg = glassSurface;
export const navSurface = glassSurface;
export const surface = glassSurface;

export const surfaceFill = style({
  position: 'absolute',
  left: glassVars.borders.width.css(),
  top: glassVars.borders.width.css(),
  width: `calc(100% - ${glassVars.borders.width.double().css()})`,
  height: `calc(100% - ${glassVars.borders.width.double().css()})`,
  ...borders(innerRadius, { allowRadiusOnly: true }),
  ...baseSurfaceBackground,
  pointerEvents: 'none',
  zIndex: 0,
});

export const surfaceShine = style({
  position: 'absolute',
  left: glassVars.borders.width.css(),
  top: glassVars.borders.width.css(),
  width: '100%',
  height: '100%',
  ...borders(innerRadius, { allowRadiusOnly: true }),
  background: `linear-gradient(135deg, ${glassVars.surfaceGlowPrimaryTint
    .alpha(glassVars.surfaceGlow.primaryTintAlpha)
    .css()}, ${glassVars.surfaceGlowSecondaryTint
    .alpha(glassVars.surfaceGlow.secondaryTintAlpha)
    .css()})`,
  mixBlendMode: 'screen',
  filter: `blur(${glassVars.surfaceGlow.blur.css()})`,
  opacity: glassVars.surfaceGlow.opacity,
  pointerEvents: 'none',
  zIndex: 2,
});

export const element = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  ...borders(glassVars.borders, { allowRadiusOnly: true }),
  zIndex: 4,
});

export const grain = style({
  position: 'absolute',
  left: glassVars.borders.width.css(),
  top: glassVars.borders.width.css(),
  width: `calc(100% - ${glassVars.borders.width.double().css()})`,
  height: `calc(100% - ${glassVars.borders.width.double().css()})`,
  pointerEvents: 'none',
  ...borders(innerRadius, { allowRadiusOnly: true }),
  ...noiseBg({ backgroundImage: glassNoise() }),
  zIndex: 3,
});

export const stroke = style({
  transform: `translateY(${glassVars.borders.width.multiply(-0.25).css()})`,
});

export const shadow = style({
  filter: globalDropShadowFilter(),
});

export const content = style({
  position: 'relative',
});
