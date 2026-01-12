import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import {
  borderVars,
  colorVars,
  themeColours,
} from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { borders } from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { fontStylesFromFontVariant } from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',
  alignItems: 'stretch',
  selectors: {
    ...mediaQueryStyle({
      snug: {
        gridTemplateColumns: '1fr',
      },
    }),
  },
});

export const intro = style({
  ...margins({
    bottom: layoutVars.content.gap,
  }),
});

export const tileA = style({});

export const tileB = style({});

export const tileC = style({});

export const tileD = style({});

export const root = style({
  position: 'relative',
  height: '100%',

  ...borders.radii(borderVars),
  ...paddings(m(36)),
  selectors: {
    ...mediaQueryStyle({
      snug: {
        ...paddings({
          vertical: m(36),
          horizontal: anchorMenuVars.handle.sizeWithBorder,
        }),
      },
    }),
  },
});

export const content = style({
  position: 'relative',
  zIndex: 2,
});

export const tilePanel = style({
  position: 'relative',
  display: 'block',
  height: '100%',
  overflow: 'hidden',
});

globalStyle(`${tilePanel}.${tileA}`, {
  ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.a)),
});
globalStyle(`${tilePanel}.${tileB}`, {
  ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.b)),
});
globalStyle(`${tilePanel}.${tileC}`, {
  ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.c)),
});
globalStyle(`${tilePanel}.${tileD}`, {
  ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.d)),
});

export const bgDecoration = style({
  position: 'absolute',
  top: 0,
  right: 0,
  opacity: 0.15,
  zIndex: 0,
});

// globalStyle(`.${bgDecoration}.${tileA}`, {
//   transform: 'rotate(33deg) scale(1.2) translate(0%, -20%)',
//   // ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.a)),
// });
// globalStyle(`.${bgDecoration}.${tileB}`, {
//   transform: 'rotate(33deg) scale(1.4) translate(0%, -30%)',
//   // ...egradientAsBgImg(buildLinear(themeColours.gradients.cards.b)),
// });
// globalStyle(`.${bgDecoration}.${tileC}`, {
//   transform: 'rotate(33deg) scale(1.1)translate(0%, -12%)',
//   // ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.c)),
// });
// globalStyle(`.${bgDecoration}.${tileD}`, {
//   transform: 'rotate(33deg) scale(1.5) translate(0%, -23%)',
//   // ...gradientAsBgImg(buildLinear(themeColours.gradients.cards.d)),
// });

export const tileIconPlaceholder = style({
  width: '44px',
  height: '44px',
  marginBottom: '18px',
  ...borders({
    width: m(1),
    color: colorVars.white.alpha(0.2),
    radius: m(10),
  }),
});

export const tilePanelSurface = style({
  height: '100%',
});

export const title = style({
  ...borders({
    bottom: {
      width: m(1),
      color: colorVars.white.alpha(0.2),
    },
  }),
  ...margins({
    bottom: m(1, 'em'),
  }),
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.h3,
    baseVariant: typographyFontVariants.heading,
  }),
});
