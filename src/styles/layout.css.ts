import { style } from '@vanilla-extract/css';
import { margins, paddings } from './helpers/spacing.helper';
import { layoutVars } from '../tokens/layout.tokens';
import { mediaQueryStyle } from './responsive/mediaQueries';
import { m } from 'css-calipers';

export const content = style({
  position: 'relative',
  maxWidth: layoutVars.contentWidth.css(),
  ...margins({
    horizontal: 'auto',
  }),
  ...paddings({
    horizontal: layoutVars.contentPadding,
  }),

  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          horizontal: m(0),
        }),
      },
    }),
  },
});

export const title = style({});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
});

export const page = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 0,
});

export const main = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'clamp(2rem, 4vw, 4rem)',
});

export const svgOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  opacity: 0.1,
});
