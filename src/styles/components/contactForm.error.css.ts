import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { formVars } from '../../tokens/forms.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import { paddings } from '../helpers/spacing.helper';

export const root = style({});

export const main = style({});

export const body = style({});

export const heading = style({});

export const iconWrap = style({
  width: '100px',
  height: '100px',
  ...backgrounds({
    color: formVars.errorPanel.icon.background,
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...paddings(m(20)),
  ...borders(formVars.errorPanel.icon.border),
});

export const statusError = style([
  {
    ...backgrounds(formVars.status.error.backgrounds),
    ...borders(formVars.status.error.borders),
  },
]);

export const copy = style({});

export const icon = style({
  width: '60px',
  height: '60px',
  color: formVars.errorPanel.icon.color.css(),
});

globalStyle(`${icon} path[data-error="true"]`, {
  stroke: formVars.errorPanel.icon.detail.color.css(),
});
