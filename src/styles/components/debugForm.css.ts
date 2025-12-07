import { style } from '@vanilla-extract/css';
import { formTokens } from '@/tokens/forms.tokens';
import { glassyButtonTokens } from '@/tokens/glassy.tokens';
import { paddings, margins } from '@/styles/helpers/spacing.helper';
import { boxShadow } from '@/styles/helpers/shadow.helper';
import { backgrounds } from '@/styles/helpers/background.helper';
import { m } from 'css-calipers';
import borders from '../helpers/borders.helper';

const doubledFieldGap = formTokens.layout.fieldGap.multiply(2);
const halfFieldGap = formTokens.layout.fieldGap.divide(2);

export const stack = style({
  maxWidth: formTokens.layout.maxWidth.css(),
  ...margins({
    vertical: m(0),
    horizontal: 'auto',
  }),
  display: 'flex',
  flexDirection: 'column',
  gap: doubledFieldGap.css(),
});

export const block = style({
  ...borders(formTokens.field.borders),
  ...paddings({ all: doubledFieldGap }),
  ...backgrounds(formTokens.field.backgrounds),
  boxShadow: boxShadow({
    x: m(0),
    y: m(40),
    blur: m(140),
    color: formTokens.field.backgrounds.color,
    alpha: 0.35,
  }),
  display: 'flex',
  flexDirection: 'column',
  gap: formTokens.layout.fieldGap.css(),
});

export const eyebrow = style({
  textTransform: 'uppercase',
  letterSpacing: 2,
  fontSize: 12,
  color: formTokens.label.text.color.css(),
  margin: 0,
});

export const title = style({
  ...margins({
    top: m(0),
    horizontal: m(0),
    bottom: m(4),
  }),
  fontSize: 20,
  color: formTokens.field.text.color.css(),
});

export const list = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: formTokens.layout.fieldGap.css(),
});

export const helperText = style({
  ...margins({
    top: m(8),
    horizontal: m(0),
    bottom: m(0),
  }),
  fontSize: 14,
  color: formTokens.counter.text.color.css(),
  lineHeight: 1.5,
});

export const ctaList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: formTokens.layout.fieldGap.css(),
});

export const ctaRow = style({
  ...borders(formTokens.field.borders),
  ...paddings({ all: formTokens.layout.fieldGap }),
  ...backgrounds(formTokens.field.backgrounds),
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const ctaButton = style({
  minHeight: formTokens.button.minHeight.css(),
  ...paddings({ horizontal: formTokens.button.paddings.horizontal }),
  ...borders(glassyButtonTokens.borders),
  ...backgrounds(glassyButtonTokens.backgrounds),
  color: glassyButtonTokens.text.color.css(),
  fontWeight: 600,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: halfFieldGap.css(),
  boxShadow: boxShadow(glassyButtonTokens.boxShadows),
});

export const code = style({
  fontSize: 12,
  ...paddings({
    vertical: m(2),
    horizontal: m(6),
  }),
  borderRadius: 6,
  ...backgrounds({ color: 'rgba(255,255,255,0.08)' }),
  ...borders({
    width: m(1),
    color: 'rgba(255,255,255,0.12)',
  }),
});

export const accentListItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  ...borders({
    left: {
      width: m(4),
      color: 'currentColor',
    },
  }),
  paddingLeft: formTokens.layout.fieldGap.css(),
});
