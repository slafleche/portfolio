import { style } from '@vanilla-extract/css';

import { formVars } from '../../tokens/forms.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';

export const root = style({});


export const main = style({});

export const body = style({});

export const heading = style({});

export const iconWrap = style({});

export const statusError = style([
  {
    ...backgrounds(formVars.status.error.backgrounds),
    ...borders(formVars.status.error.borders),
  },
]);


export const copy = style({});

export const icon = style({
  width: '36px',
  height: '36px',
  // color: formVars.status.icon.color.css(),
});
