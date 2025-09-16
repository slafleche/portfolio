import { style } from '@vanilla-extract/css';
import { glassVars, glossyBorderVars } from './helpers/effects';
import * as CSS from 'csstype';
import { absolutePosition } from './helpers/positioning';
import borders from './helpers/border';

export const glassyBg = style({
  position: 'relative',
  background: [
    `linear-gradient(135deg, ${glassVars.tint1}, ${glassVars.tint2})`,
    glassVars.bg,
  ].join(', '),
  //   boxShadow: glassVars.shadow,
  backdropFilter: `blur(${glassVars.blur})`,
  WebkitBackdropFilter:
    `blur(${glassVars.blur})` as CSS.Property.BackdropFilter,

  // Glossy border
  ...borders({
    width: glossyBorderVars.thickness.css(),
    color: 'transparent',
  }),
});

export const glassyElement = style({
  position: 'relative',
  width: '100%',
  height: '100%',
});

export const glassGrain = style({
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
