import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { formVars } from '../../tokens/forms.tokens';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import { colors, colorVars } from '../../tokens/global.tokens';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import { textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';

export const root = style({
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  ...margins({
    top: m(10),
    bottom: m(20),
  }),
  ...borders({
    width: m(1),
    color: colorVars.white.alpha(0.3),
    radius: m(15),
  }),
  ...backgrounds({
    color: colors.white.alpha(0.05),
  }),
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),

  selectors: {
    '&[data-empty="true"]': {
      opacity: 0,
      height: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      ...margins(m(0)),
      ...paddings(m(0)),
      border: 'none',
    },
  },
});

export const main = style({
  display: 'block',
  width: '100%',
  ...paddings(m(8)),
  ...borders({
    bottom: {
      width: m(1),
      color: colorVars.white.alpha(0.1),
    },
  }),
});

export const statusWrapper = style({
  textAlign: 'left',
  width: '100%',
});

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
  gap: formVars.layout.fieldGap.css(),
  zIndex: 1300,
  pointerEvents: 'none',
  outline: 'none',
});

export const statusText = style({
  flex: 1,
  selectors: {
    '&:not(li)': {
      textAlign: 'center',
      ...paddings({
        vertical: m(8),
        horizontal: m(12),
      }),
    },
  },
});

export const status = style({});

globalStyle(`.${statusText} + .${statusText}`, {
  ...margins({
    top: m(8),
  }),
});

export const statusSuccessStandalone = style({
  width: '100%',
});
