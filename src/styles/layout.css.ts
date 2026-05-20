import { style } from '@vanilla-extract/css';

import { colors } from '../tokens/global.tokens';
import { layoutVars } from '../tokens/layout.tokens';
import { anchorMenuVars } from '../tokens/menu.tokens';
import { backgrounds } from './helpers/background.helper';
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
    bottom: layoutVars.content.gap,
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
            ...paddings(0),
            ...margins({
              bottom: 0,
            }),
          },
        },
      },
    }),
  },
});

export const sectionSpacing = style({
  ...margins({
    top: layoutVars.content.gap,
  }),
});

export const title = style({
  ...paddings({
    top: 0,
  }),
});

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
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...backgrounds({
          color: colors.bodyBg.darken(0.5).alpha(0.5),
        }),
      },
    }),
  },
});

export const main = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  columnGap: layoutVars.content.gap.css(),
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
          bottom: 0,
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
  selectors: {
    ...mediaQueryStyle({
      compact: {
        display: 'none',
      },
    }),
  },
});
