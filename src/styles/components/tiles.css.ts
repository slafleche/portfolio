import { globalStyle, style } from '@vanilla-extract/css';
import { m, mEm } from 'css-calipers';

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
import { textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { fontStylesFromFontVariant } from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';
import { userContent } from '../typography.css';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',
  alignItems: 'stretch',
  selectors: {
    ...mediaQueryStyle({
      snug: {
        gridTemplateColumns: '1fr',
        gap: '0px',
        ...margins({
          top: m(60),
        }),
      },
    }),
  },
});

export const span2 = style({
  gridColumn: 'span 2',
  selectors: {
    ...mediaQueryStyle({
      snug: {
        gridColumn: 'span 1',
      },
    }),
  },
});

export const intro = style({
  ...margins({
    bottom: layoutVars.content.gap,
  }),
});

export const introWrapper = style({
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          horizontal: anchorMenuVars.handle.sizeWithBorder,
        }),
      },
    }),
  },
});

export const tileA = style({});

export const tileB = style({});

export const tileC = style({});

export const tileD = style({});

const paddingDefault = m(36);
const paddingTight = anchorMenuVars.handle.sizeWithBorder;

export const root = style({
  position: 'relative',
  height: '100%',

  ...borders.radii(borderVars),
  ...paddings(paddingDefault),
  selectors: {
    ...mediaQueryStyle({
      snug: {
        ...paddings({
          vertical: paddingDefault,
          horizontal: paddingTight,
        }),
      },
    }),
  },
});

export const content = style({
  position: 'relative',
  zIndex: 2,
  fontSize: '18px',
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
});

globalStyle(`.${content} .${userContent} p[data-last="true"]`, {
  ...paddings({ bottom: 0 }),
  ...margins({ bottom: 0 }),
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

export const tileIconPlaceholder = style({
  width: '44px',
  height: '44px',
  ...margins({
    bottom: m(18),
  }),
  ...borders({
    width: m(1),
    color: colorVars.white.alpha(0.2),
    radius: m(10),
  }),
});

export const tilePanelSurface = style({
  height: '100%',
});

const titleLineHeight = 1.2;

export const title = style({
  display: 'block',
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.h3,
    baseVariant: typographyFontVariants.heading,
    extraConfig: {
      styleOverrides: {
        lineHeight: titleLineHeight,
      },
    },
  }),
  ...margins({
    top: mEm(-0.18),
  }),
  ...paddings({
    top: 0,
    bottom: mEm(1.3),
  }),
});

export const separator = style({
  width: `calc(100% + ${paddingDefault.double().css()})`,
  ...margins({
    left: paddingDefault.negation(),
    bottom: paddingDefault,
  }),
  ...borders({
    bottom: {
      width: m(0.5),
      color: colorVars.white.alpha(0.5),
    },
  }),
  selectors: {
    ...mediaQueryStyle({
      snug: {
        width: `calc(100% + ${paddingTight.double().css()})`,
        ...margins({
          left: paddingTight.negation(),
          bottom: m(30),
        }),
      },
    }),
  },
});
