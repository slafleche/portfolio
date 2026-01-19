import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { colorVars } from '../../tokens/global.tokens';
import { backgrounds } from '../helpers/background.helper';
import { important } from '../helpers/important.helper';
import { paddings } from '../helpers/spacing.helper';

export const heroOverride = style({
  ...important({
    height: '100%',
    minHeight: '100%',
  }),
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

export const frame = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

export const content = style({
  position: 'relative',
  zIndex: 2,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const glassContent = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  ...paddings({ horizontal: m(80) }),
});
