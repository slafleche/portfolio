import { style } from '@vanilla-extract/css';
import { colorVars } from '../vars';

export const arch = style({});

export const svg = style({
  color: colorVars.navBg.css(),
});
