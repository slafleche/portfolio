import { style } from '@vanilla-extract/css';
import * as CSS from 'csstype';
import { colorVars } from '../vars';

export const arch = style({
  position: 'relative',
});

export const svg = style({
  overflow: 'visible',
});

export const shadow = style({
  fill: colorVars.shadow.css() as CSS.Property.Fill,
  filter: 'blur(18px)',
});
