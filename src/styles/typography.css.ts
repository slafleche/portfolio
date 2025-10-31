import { globalStyle, style } from '@vanilla-extract/css';
import { colorVars, fontVars } from './vars';
import { composeFontStyles } from './helpers/typography';

export const heading = style({
  color: colorVars.bodyFg.css(),
  ...composeFontStyles({ token: fontVars.heading }),
});

globalStyle('h2[data-ui]="heading"', {
  ...composeFontStyles({ token: fontVars.h2 }),
});

globalStyle('h3[data-ui]="heading"', {
  ...composeFontStyles({ token: fontVars.h3 }),
});

globalStyle('h4[data-ui]="heading"', {
  ...composeFontStyles({ token: fontVars.h4 }),
});

globalStyle('h5[data-ui]="heading"', {
  ...composeFontStyles({ token: fontVars.h5 }),
});

globalStyle('h6[data-ui]="heading"', {
  ...composeFontStyles({ token: fontVars.h6 }),
});
