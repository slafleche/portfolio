import { style } from '@vanilla-extract/css';

import { colors } from '../../tokens/global.tokens';
import { backgrounds } from '../helpers/background.helper';

export const root = style({
  ...backgrounds({
    color: colors.black.alpha(0.8),
  }),
});

export const mock = style({
});
