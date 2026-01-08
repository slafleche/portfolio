import { globalStyle, style } from '@vanilla-extract/css';

import { layoutVars } from '../tokens/layout.tokens';
import { anchorMenuVars } from '../tokens/menu.tokens';
import { margins, paddings } from './helpers/spacing.helper';
import { mediaQueryStyle } from './responsive/mediaQueries';

export const content = style({
  position: 'relative',
  maxWidth: layoutVars.content.width
    .add(layoutVars.content.padding.double())
    .css(),
  width: '100%',
  ...margins({
    horizontal: 'auto',
  }),
  ...paddings({
    horizontal: layoutVars.content.padding,
  }),

  selectors: {
    "&[data-margin='skip']": {
      marginTop: 0,
    },
    ...mediaQueryStyle({
      fullSize: {
        selectors: {
          "&[data-query-fullsize='no-padding']": {
            ...paddings({
              horizontal: 0,
            }),
          },
        },
      },
      compact: {
        ...paddings({
          horizontal: anchorMenuVars.handle.sizeWithBorder,
        }),
        selectors: {
          "&[data-query-compact='no-padding']": {
            ...paddings({
              horizontal: 0,
            }),
          },
        },
      },
    }),
  },
});

globalStyle(`.${content} + .${content}`, {
  marginTop: layoutVars.content.gap.css(),
});

export const sectionSpacing = style({
  marginTop: layoutVars.content.gap.css(),
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
  gap: layoutVars.content.gap.css(),
  ...paddings({
    bottom: layoutVars.content.padding.multiply(1.5),
  }),
  selectors: {
    ...mediaQueryStyle({
      noEdge: {
        ...paddings({
          bottom: layoutVars.content.padding,
        }),
      },
      compact: {
        ...paddings({
          bottom: anchorMenuVars.handle.sizeWithBorder,
        }),
      },
    }),
  },
});

export const svgOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  opacity: 0.02,
});
