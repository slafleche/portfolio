import { style } from '@vanilla-extract/css';
import * as csstype from 'csstype';
import { colorVars } from '../vars';

export const arch = style({
  position: 'relative',
});

export const svg = style({});

export const shadow = style({
  fill: colorVars.shadow.css() as csstype.Property.Fill,
  filter: 'blur(18px)',
});
