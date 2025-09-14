import { style } from '@vanilla-extract/css';
import { colorVars } from '../vars.css';

export const arch = style({});

export const svg = style({
  color: colorVars.navBg.css(),
});
