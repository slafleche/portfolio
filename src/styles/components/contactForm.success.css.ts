import { style } from '@vanilla-extract/css';

import { formVars } from '../../tokens/forms.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';

export const root = style({
  // display: 'flex',
  // height: '100%',
  // flexDirection: 'column',
  // alignItems: 'center',
  // justifyItems: 'center',
  // textAlign: 'center',
});

export const main = style({});

export const heading = style({
  // ...fontStylesFromFontVariant({
  //   variant: typographyFontVariants.h2,
  //   baseVariant: typographyFontVariants.heading,
  // }),
  // fontSize: '1.35rem',
  // fontWeight: 700,
  // color: colorVars.white.alpha(0.95).css(),
});

export const iconWrap = style({
  width: '64px',
  height: '64px',
  ...backgrounds({
    color: formVars.successPanel.icon.background,
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const copy = style({});

export const icon = style({
  width: '36px',
  height: '36px',
  color: formVars.successPanel.icon.color.css(),
});

export const statusSuccess = style([
  {
    ...backgrounds(formVars.status.success.backgrounds),
    ...borders(formVars.status.success.borders),
  },
]);
