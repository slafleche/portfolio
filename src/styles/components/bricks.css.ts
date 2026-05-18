import { style } from '@vanilla-extract/css';

import { bricksLayout } from '../componentTokens/brick.component.tokens';
import { mediaQueryStyle } from '../responsive/mediaQueries';

const { desktop, mobile, gap } = bricksLayout.grid;

export const root = style({
  display: 'grid',
  gridTemplateColumns: `repeat(${desktop.columns}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${desktop.rows}, minmax(0, 1fr))`,
  gap: gap.css(),
  alignItems: 'stretch',
  width: '100%',
  selectors: {
    ...mediaQueryStyle({
      compact: {
        gridTemplateColumns: `repeat(${mobile.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${mobile.rows}, minmax(0, 1fr))`,
      },
    }),
  },
});
