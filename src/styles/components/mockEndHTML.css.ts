import { style } from '@vanilla-extract/css';
import { paddings } from '../helpers/spacing.helper';
import { borders } from '../helpers/borders.helper';
import { backgrounds } from '../helpers/background.helper';
import { m, mPercent } from 'css-calipers';

const codeFontStack =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const root = style({
  ...paddings({
    top: m(18),
    bottom: m(20),
    horizontal: m(18),
  }),
  ...backgrounds({
    color: '#0f111a',
    image:
      'linear-gradient(180deg, rgba(15,17,26,0) 0%, rgba(15,17,26,0.55) 18%, rgba(15,17,26,0.9) 100%)',
  }),
  ...borders.top({
    width: m(1),
    color: 'rgba(255, 255, 255, 0.08)',
  }),
  fontFamily: codeFontStack,
  fontSize: '12px',
  lineHeight: 1.45,
  color: '#c9d1d9',
});

export const rows = style({
  whiteSpace: 'pre',
});

export const row = style({
  display: 'block',
});

export const indent = style({
  display: 'inline-block',
  width: m(16).css(),
});

export const guide = style({
  display: 'inline-block',
  height: m(14).css(),
  borderLeft: '1px dotted rgba(255, 255, 255, 0.12)',
  marginRight: '-1px',
  verticalAlign: '-2px',
});

export const tag = style({
  color: '#8ab4f8',
});

export const attr = style({
  color: '#fdd663',
});

export const value = style({
  color: '#81c995',
});

export const comment = style({
  color: '#8b949e',
});

export const text = style({
  color: '#c9d1d9',
});

export const disc = style({
  display: 'inline-block',
  width: m(12).css(),
  color: 'rgba(201, 209, 217, 0.55)',
});

export const ellipsis = style({
  color: 'rgba(201, 209, 217, 0.55)',
});

export const hint = style({
  display: 'inline-block',
  marginLeft: m(8).css(),
  ...paddings({
    horizontal: m(6),
  }),
  ...borders.radii({
    radius: {
      all: mPercent(50),
    },
  }),
  borderWidth: m(1).css(),
  borderStyle: 'solid',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  color: 'rgba(201, 209, 217, 0.72)',
  fontSize: '11px',
  lineHeight: '16px',
  verticalAlign: '1px',
});
