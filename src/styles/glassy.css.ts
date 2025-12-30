import { style } from '@vanilla-extract/css';
import {
  createGlassBackground,
  glassNoise,
} from './helpers/glassy.helper';
// import { glassVars } from '../tokens/glassy.tokens';
import { noiseBg } from './helpers/noiseSVG.helper';
import backdropFilters from './helpers/backdropFilter.helper';
import { fullSizeOfParent } from './helpers/positioning.helper';

const glassBackground = createGlassBackground();

const baseSurfaceBackground = {
  backgroundColor: glassBackground.backgroundColorValue,
  backgroundImage: glassBackground.backgroundImageValue,
} as const;

// Root container, no glassy styles here.
export const root = style({
  display: 'block',
  position: 'relative',
  zIndex: 0,
});

// export const effects = style({
//   ...fullSizeOfParent(),
//   pointerEvents: 'none',
// });

export const content = style({
  position: 'relative',
  zIndex: 1,
});

export const glassySurface = {
  ...baseSurfaceBackground,
  ...backdropFilters.style(glassBackground.backdropFilterIntent),
  backgroundClip: 'padding-box',
};

// Main glass surface style
export const surface = style({
  ...glassySurface,
});

export const glassyNoise = noiseBg({ backgroundImage: glassNoise() });

// Grain / noise overlay style
export const grain = style({
  ...fullSizeOfParent(),
  pointerEvents: 'none',
  ...glassyNoise,
});
