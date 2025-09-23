import { style } from '@vanilla-extract/css';
// import { colorVars } from '../vars';
import { absolutePosition } from '../helpers/positioning';
import { dropShadowVars } from '../vars';

export const arch = style({
  position: 'relative',
  overflow: 'visible',
});

export const svg = style({
  overflow: 'visible',
});

export const shadow = style({
  ...absolutePosition.topLeft(),
  // Give extra room so the blurred, offset shadow doesn’t clip
  width: `calc(100% + ${dropShadowVars.offsetX.css()} + ${dropShadowVars.blur.css()} + ${dropShadowVars.blur.css()})`,
  height: `calc(100% + ${dropShadowVars.offsetY.css()} + ${dropShadowVars.blur.css()} + ${dropShadowVars.blur.css()})`,
  pointerEvents: 'none',
  filter: `blur(${dropShadowVars.blur.css()})`,
});

export const shadowPath = style({
  fill: dropShadowVars.color.css(),
});
