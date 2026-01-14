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
    bottom: layoutVars.content.gap,
  }),
  ...paddings({
    horizontal: layoutVars.content.padding,
  }),

  selectors: {
    "&[data-query-all='no-margin']": {
      ...margins({
        bottom: 0,
      }),
    },
    "&[data-spacing='no-bottom']": {
      ...margins({
        bottom: 0,
      }),
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
              bottom: 0,
            }),
          },
          "&[data-query-compact='no-margin']": {
            ...margins({
              bottom: 0,
            }),
          },
          "&[data-query-compact='no-padding-no-margin']": {
            ...paddings({
              horizontal: 0,
            }),
            ...margins({
              bottom: 0,
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
  minHeight: [
    '100vh',
    '100dvh',
  ],
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
    "&[data-query-all='no-margin']": {
      ...margins({
        bottom: 0,
      }),
    },
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          bottom: anchorMenuVars.handle.sizeWithBorder,
        }),
        selectors: {
          "&[data-query-compact='no-padding']": {
            ...paddings({
              bottom: 0,
            }),
          },
        },
      },
    }),
  },
});

export const svgOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: [
    '100vh',
    '100dvh',
  ],
  pointerEvents: 'none',
  opacity: 0.02,
});
