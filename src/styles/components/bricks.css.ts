import { style } from '@vanilla-extract/css';

import { bricksLayout } from '../componentTokens/brick.component.tokens';
import { componentMediaQueries } from '../responsive/mediaQueries';

const { desktop, gap } = bricksLayout.grid;

export const root = style({
  display: 'grid',
  gridTemplateColumns: desktop.columns,
  gridTemplateRows: `repeat(${desktop.rows}, minmax(0, 1fr))`,
  gap: gap.css(),
  alignItems: 'stretch',
  width: '100%',
  selectors: {
    ...componentMediaQueries({
      bricks_twoColumn: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gridTemplateRows: 'auto',
        gridAutoRows: 'auto',
      },
      bricks_oneColumn: {
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto',
        gridAutoRows: 'auto',
      },
    }),
  },
});
