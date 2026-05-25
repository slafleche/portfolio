import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { colorVars } from '../../tokens/global.tokens';
import { backgrounds } from '../helpers/background.helper';
import { important } from '../helpers/important.helper';
import { paddings } from '../helpers/spacing.helper';
import { blogMain } from './hero.css';

export const heroOverride = style({
  ...important({
    height: '100%',
    minHeight: '100%',
  }),
});

globalStyle(`[data-id="no-css-frameworks"] .${blogMain}`, {
  ...paddings({ vertical: m(48) }),
});

export const debugRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  ...paddings({ all: m(32) }),
  ...backgrounds({ color: colorVars.black }),
});

export const debugLabel = style({
  color: colorVars.white.css(),
  fontSize: '14px',
  letterSpacing: '0.02em',
});

export const viewport = style({
  position: 'relative',
  overflow: 'hidden',
});
