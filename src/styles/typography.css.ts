import { globalStyle, style } from '@vanilla-extract/css';
import { colorVars, fontVars } from './vars';

export const heading = style({
  color: colorVars.bodyFg.css(),
  fontFamily: fontVars.heading.family,
});

globalStyle('h2[data-ui]="heading"', {
  // to do
});

globalStyle('h3[data-ui]="heading"', {
  // to do
});

globalStyle('h4[data-ui]="heading"', {
  // to do
});

globalStyle('h5[data-ui]="heading"', {
  // to do
});
globalStyle('h6[data-ui]="heading"', {
  // to do
});
