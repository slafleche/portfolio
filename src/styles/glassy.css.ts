import { style } from '@vanilla-extract/css';
import { glassVars, glossyBorderVars } from './helpers/effects';
import { globalDropShadowFilter } from './helpers/shadow';
import * as CSS from 'csstype';
import { absolutePosition } from './helpers/positioning';
import { modify } from './helpers/measurement';
// import borders from './helpers/border';

export const bg = style({
  position: 'relative',
  background: [
    `linear-gradient(135deg, ${glassVars.tint1}, ${glassVars.tint2})`,
    glassVars.bg,
  ].join(', '),
  backdropFilter: `blur(${glassVars.blur})`,
  WebkitBackdropFilter:
    `blur(${glassVars.blur})` as CSS.Property.BackdropFilter,
});

export const element = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

export const grain = style({
  ...absolutePosition.fullSize(),
  inset: 0,
  pointerEvents: 'none',
  borderRadius: 'inherit',
  backgroundImage: glassVars.noiseDataUri, // uses your SVG noise
  backgroundRepeat: 'repeat',
  backgroundSize: '240px 240px',
  mixBlendMode: 'overlay',
  opacity: '0.03',
});

// Stroke on bottom
export const stroke = style({
  transform: `translateY(${modify(
    glossyBorderVars.thickness,
    glossyBorderVars.thickness.value * -0.25,
  ).css()})`,
});

// Shadow on the bottom
export const shadow = style({
  // Use a global drop-shadow() based on dropShadowVars so it’s configurable in vars.ts
  filter: globalDropShadowFilter(),
});
