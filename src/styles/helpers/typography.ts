import { style } from '@vanilla-extract/css';
import { colorVars } from '../vars.css';

export const heading = style({
  color: colorVars.bodyFg.css(),
});
