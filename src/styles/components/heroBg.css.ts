import { style } from '@vanilla-extract/css';

import { absolutePosition } from '../helpers/positioning.helper';

// Global shared styles for hero background components
export const root = style({
  ...absolutePosition.fullSize(),
  overflow: 'hidden',
  position: 'relative',
});

export const transformOrigin = style({
  transformOrigin: '50% 50%',
});
