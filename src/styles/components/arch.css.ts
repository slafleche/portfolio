import { style } from '@vanilla-extract/css';
import { colorVars } from '../vars';

export const arch = style({
  position: "relative"
});

export const svg = style({});

export const path = style({
  fill: colorVars.navBg.css(),
});
