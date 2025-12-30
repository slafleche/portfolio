import { keyframes, style } from '@vanilla-extract/css';
import { themeColours } from '../../tokens/global.tokens';
import { fullSizeOfParent } from '../helpers/positioning.helper';

export const blobWrap = style({
  ...fullSizeOfParent(),
  overflow: 'visible',
  pointerEvents: 'none',
});

export const blobField = style({
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
});

export const blobGroup = style({});

const slowSpin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const blobSpin = style({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

export const blobShape = style({
  mixBlendMode: 'normal',
  opacity: 1,
  transformBox: 'view-box',
  transformOrigin: '0 0',
});

export const bigTriangle = style({});
export const nubbyTriangle = style({});
export const hexagon = style({});

// Big Triangle
export const bigTriangleAnimation = style({
  animation: `${slowSpin} 97s linear infinite`,
});
export const bigTriangleGradientStart = style({
  stopColor: themeColours.lights.c.css(),
});
export const bigTriangleGradientEnd = style({
  stopColor: themeColours.lights.d.css(),
});

// Nubby Triangle

export const nubbyTriangleAnimation = style({
  animation: `${slowSpin} 37s linear infinite reverse`,
});
export const nubbyTriangleGradientStart = style({
  stopColor: themeColours.lights.d.css(),
});
export const nubbyTriangleGradientEnd = style({
  stopColor: themeColours.lights.e.css(),
});

// Hexagon
export const hexagonAnimation = style({
  animation: `${slowSpin} 59s linear infinite`,
});
export const hexagonGradientStart = style({
  stopColor: themeColours.lights.c.css(),
});
export const hexagonGradientEnd = style({
  stopColor: themeColours.lights.a.css(),
});
