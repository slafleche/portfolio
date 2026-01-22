import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import {
  gridLayoutVars,
  layoutVars,
} from '../../tokens/layout.tokens';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  componentMediaQueries,
  mediaQueryStyle,
} from '../responsive/mediaQueries';

export const root = style({
  display: 'grid',
  alignItems: 'stretch',
  gap: gridLayoutVars.gap.css(),
  maxWidth: layoutVars.content.width
    .add(layoutVars.content.padding.double())
    .css(),
  ...paddings({
    horizontal: layoutVars.content.padding,
  }),
  width: '100%',
  ...margins({
    top: m(36),
    horizontal: 'auto',
  }),
  selectors: {
    ...componentMediaQueries({
      card_oneColumn: {
        ...paddings({
          top: m(18),
        }),
      },
    }),
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          horizontal: m(0),
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
