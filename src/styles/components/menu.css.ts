import { style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { menuFontVariants } from '../../tokens/fontVariants/menu';
import { themeColours } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import {
  anchorMenuVars,
  localeSwitcherVars,
  logoVars,
} from '../../tokens/menu.tokens';
import borders from '../helpers/borders.helper';
import {
  fontStylesFromFontVariant,
  relativeFontWeight,
} from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

// import { m, mPercent } from 'css-calipers';
// import transforms from '../helpers/transforms.helper';
// import { menuVars } from '../componentTokens/menu.componentTokens';

export const root = style({
  position: 'relative',
  zIndex: 100,
});

export const viewportFrame = style({
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 100,
  pointerEvents: 'none',
});

export const nav = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
});

export const homeLink = style({
  position: 'absolute',
  overflow: 'hidden',
  cursor: 'pointer',
  top: logoVars.offsetY.css(),
  left: logoVars.offsetX.css(),
  width: logoVars.width.css(),
  height: logoVars.width.css(),
  ...borders(logoVars.borders),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  zIndex: 10,
  transform: 'background-color 0.5s ease-out',
  selectors: {
    ...mediaQueryStyle({
      compact: {
        width: logoVars.compact.width.css(),
        height: logoVars.compact.width.css(),
        top: logoVars.compact.offsetY.css(),
        left: logoVars.compact.offsetX.css(),
      },
    }),
    '&:hover': {
      backgroundColor: themeColours.secondary.alpha(0.5).css(),
    },
    // '&:focus-visible, &:focus': {
    //   backgroundColor: themeColours.secondary.saturate(1).css(),
    // },
  },
});

export const items = style({});

export const item = style({});

export const logoItem = style({});

export const localeItem = style({
  position: 'absolute',
  display: 'flex',
  transform: 'translateY(-50%)',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: layoutVars.content.padding.css(),
  height: localeSwitcherVars.height.css(),
  top: localeSwitcherVars.offsetY.css(),
  right: localeSwitcherVars.offsetX.css(),
  color: localeSwitcherVars.color.css(),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        transform: 'translateY(0)',
        width: anchorMenuVars.handle.sizeWithBorder.css(),
        top: localeSwitcherVars.compact.offsetY.css(),
        right: localeSwitcherVars.compact.offsetX.css(),
      },
    }),
  },
});

export const localeLink = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: localeSwitcherVars.fontSize.css(),
  ...fontStylesFromFontVariant({
    variant: menuFontVariants.menu,
  }),
  ...relativeFontWeight(menuFontVariants.menu, mPercent(50)),
  pointerEvents: 'auto',
  lineHeight: 1,
  ...borders.radii(m(20)),
  textShadow: `0 0 2px ${localeSwitcherVars.shadow.css()}`,
  opacity: 0.8,
  transition: 'opacity 0.2s ease-out',
  selectors: {
    '&:hover, &:focus-visible, &:focus': {
      opacity: 1,
    },
  },
});
