import {style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { colorVars } from '../../tokens/global.tokens';
import borders from '../helpers/borders.helper';
import { margins } from '../helpers/spacing.helper';

export const container = style({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  isolation: 'isolate',
  overflow: 'visible',
  textAlign: 'center',
  maxWidth: '100%',
});

export const backdrop = style({
  position: 'absolute',
  zIndex: 0,
  inset: '0 -16px',
  ...margins({ horizontal: 'auto' }),
  ...borders.radii(m(28)),
  backgroundColor: colorVars.black.alpha(0).css(),
  pointerEvents: 'none',
  transition: 'none',
});
