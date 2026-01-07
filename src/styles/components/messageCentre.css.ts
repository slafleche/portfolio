import { type ComplexStyleRule,style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { formTokens } from '../../tokens/forms.tokens';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import { colorVars } from '../../tokens/global.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { paddings } from '../helpers/spacing.helper';

export const root = style({
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: formTokens.layout.fieldGap.css(),
  ...paddings(formTokens.field.paddings),
  ...borders(formTokens.field.borders),
  ...boxShadow({
    x: m(0),
    y: m(4),
    blur: m(14),
    color: colorVars.black,
    alpha: 0.35,
  }),
  pointerEvents: 'auto',
});

export const success = style([
  {
    ...backgrounds(formTokens.status.success.backgrounds),
    ...borders(formTokens.status.success.borders),
  },
]);

export const error = style([
  {
    ...backgrounds(formTokens.status.error.backgrounds),
    ...borders(formTokens.status.error.borders),
  },
]);

export const info = style([
  {
    ...backgrounds(formTokens.status.generic.backgrounds),
    ...borders(formTokens.status.generic.borders),
  },
]);

export const title = style({
  flex: 1,
  margin: 0,
  fontWeight: 600,
});

export const close = style({
  border: 'none',
  background: 'none',
  color: colorVars.bodyFg.css(),
  fontSize: '1.25rem',
  lineHeight: 1,
  cursor: 'pointer',
  padding: 0,
  minWidth: glassyButtonTokens.iconSize.css(),
  minHeight: glassyButtonTokens.iconSize.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const viewport = style({
  position: 'fixed',
  bottom: '6px',
  right: '6px',
  width: 'min(320px, calc(100vw - 32px))',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: formTokens.layout.fieldGap.css(),
  zIndex: 1300,
  pointerEvents: 'none',
  outline: 'none',
});

export const statusWrapper = style({
  minHeight: '6px',
  transition: 'opacity 220ms ease, transform 220ms ease',
  opacity: 1,
  transform: 'translateY(0)',
  pointerEvents: 'auto',
  selectors: {
    '&[data-visible="false"]': {
      opacity: 0,
      transform: 'translateY(-8px)',
      pointerEvents: 'none',
    },
  },
});

const statusBase: ComplexStyleRule = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // ...borders(formTokens.field.borders),
  ...paddings(formTokens.field.paddings),
  gap: formTokens.layout.fieldGap.css(),
};

export const status = style(statusBase);

export const statusSuccess = style([
  statusBase,
  {
    ...backgrounds(formTokens.status.success.backgrounds),
    ...borders(formTokens.status.success.borders),
  },
]);

export const statusError = style([
  statusBase,
  {
    ...backgrounds(formTokens.status.error.backgrounds),
    ...borders(formTokens.status.error.borders),
  },
]);

export const statusGeneric = style([
  statusBase,
  {
    ...backgrounds(formTokens.status.generic.backgrounds),
    ...borders(formTokens.status.generic.borders),
  },
]);

// export const statusText = style({
//   flex: 1,
// });

export const loader = style({
  width: '100px',
  height: 'auto',
});

export const statusText = style({
  flex: 1,
});

export const statusSuccessStandalone = style({
  width: '100%',
});
