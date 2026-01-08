import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { gridLayoutVars } from '../../tokens/layout.tokens';
import { paddings } from '../helpers/spacing.helper';
import { componentMediaQueries } from '../responsive/mediaQueries';

export const root = style({
  display: 'grid',
  alignItems: 'stretch',
  gap: gridLayoutVars.gap.css(),
  selectors: {
    ...componentMediaQueries({
      card_oneColumn: {
        ...paddings({
          top: m(50),
        }),
      },
    }),
  },
});

export const column = style({
  display: 'flex',
  flexDirection: 'column',
});

export const fillRow = style({
  height: '100%',
});
