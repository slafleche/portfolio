import { style } from '@vanilla-extract/css';
import { mPercent, mVh, mVw } from 'css-calipers';

import { absolutePosition } from '../helpers/positioning.helper';

export const root = style({
  display: 'block',
  height: 'auto',
  width: '100%',
});

const width = 35;
export const wrapper = style({
  ...absolutePosition.topLeft(mPercent(5), mPercent(5)),
  width: `clamp(350px, max(${mVw(width).css()}, ${mVh(width).css()}), 700px)`,
});

export const transforms = style({});
