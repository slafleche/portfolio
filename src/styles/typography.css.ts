import { style } from '@vanilla-extract/css';
import { colorVars } from './vars';

export const heading = style({
  color: colorVars.bodyFg.css(),
});
