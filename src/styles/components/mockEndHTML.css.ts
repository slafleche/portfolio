import { style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { mockHtmlFontVariants } from '../../tokens/fontVariants/mockHtml';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { margins,paddings } from '../helpers/spacing.helper';
// import { absolutePosition } from '../helpers/positioning.helper';

export const root = style({
  // textAlign: 'left',
  // userSelect: 'none',
  // ...absolutePosition.bottomLeft(),
  ...backgrounds({
    color: '#0f111a',
    image:
      'linear-gradient(180deg, rgba(15,17,26,0) 0%, rgba(15,17,26,0.55) 18%, rgba(15,17,26,0.9) 100%)',
  }),
  ...fontStylesFromFontVariant({
    variant: mockHtmlFontVariants.code,
  }),
  ...paddings(m(16)),
});

export const rows = style({
  whiteSpace: 'pre',
});

export const row = style({
  display: 'block',
});

export const indent = style({
  display: 'inline-block',
  width: '16px',
});

export const guide = style({
  display: 'inline-block',
  height: '14px',
  ...borders.left({
    width: m(1),
    color: 'rgba(255, 255, 255, 0.12)',
    style: 'dotted',
  }),
  ...margins({
    right: m(-1),
  }),
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
  width: '12px',
  color: 'rgba(201, 209, 217, 0.55)',
});

export const ellipsis = style({
  color: 'rgba(201, 209, 217, 0.55)',
});

export const hint = style({
  display: 'inline-block',
  ...margins({
    left: m(8),
  }),
  ...paddings({
    horizontal: m(6),
  }),
  ...borders({
    radius: mPercent(50),
    width: m(1),
    color: 'rgba(255, 255, 255, 0.1)',
  }),
  ...backgrounds({
    color: 'rgba(255, 255, 255, 0.03)',
  }),
  color: 'rgba(201, 209, 217, 0.72)',
  fontSize: '11px',
  lineHeight: '16px',
  verticalAlign: '1px',
});
