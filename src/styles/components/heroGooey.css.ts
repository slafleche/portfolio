import { style } from '@vanilla-extract/css';
import { themeColours } from '../../tokens/global.tokens';
import { fullSizeOfParent } from '../helpers/positioning.helper';

export const blobField = style({
  ...fullSizeOfParent(),
  overflow: 'visible',
  pointerEvents: 'none',
});

export const blobGroup = style({
  filter: 'url(#hero-gooey)',
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
export const star = style({});


export const bigTriangleGradientStart = style({
  stopColor: themeColours.lights.c.css(),
});

export const bigTriangleGradientEnd = style({
  stopColor: themeColours.lights.d.css(),
});

export const nubbyTriangleGradientStart = style({
  stopColor: themeColours.lights.a.css(),
});

export const nubbyTriangleGradientEnd = style({
  stopColor: themeColours.lights.e.css(),
});

export const hexagonGradientStart = style({
  stopColor: themeColours.lights.b.css(),
});

export const hexagonGradientEnd = style({
  stopColor: themeColours.lights.c.css(),
});

export const starGradientStart = style({
  stopColor: themeColours.lights.d.css(),
});

export const starGradientEnd = style({
  stopColor: themeColours.lights.b.css(),
});
