import { style } from '@vanilla-extract/css';
import {
  glassNoise,
  makeGlassSurface,
} from './helpers/glassy.helper';
import { noiseBg } from './helpers/noiseSVG.helper';
import { fullSizeOfParent } from './helpers/positioning.helper';

// Root container, no glassy styles here.
export const root = style({
  display: 'block',
  position: 'relative',
  zIndex: 0,
});

export const content = style({
  position: 'relative',
  zIndex: 1,
});

// Main glass surface style
export const surface = style(makeGlassSurface())

export const glassyNoise = noiseBg({ backgroundImage: glassNoise() });

// Grain / noise overlay style
export const grain = style({
  ...fullSizeOfParent(),
  pointerEvents: 'none',
  ...glassyNoise,
});
