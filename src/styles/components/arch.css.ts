import { style } from '@vanilla-extract/css';
import { colorVars } from '../vars';

export const arch = style({
  position: 'relative',
});

export const svg = style({
  overflow: 'visible',
});

export const shadow = style({
  fill: colorVars.shadow.css(),
  filter: 'blur(18px)',
});
