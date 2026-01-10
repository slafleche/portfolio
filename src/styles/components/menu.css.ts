// import { style } from '@vanilla-extract/css';
// import { absolutePosition } from '../helpers/positioning.helper';
// import { archVars, colorVars } from '../../tokens/global.tokens';
// import {
// fontStylesFromFontVariant,
// fontVariants,
// } from '../../tokens/fontVariants.tokens';

import { style } from '@vanilla-extract/css';
import { mPercent } from 'css-calipers';

import { menuFontVariants } from '../../tokens/fontVariants/menu';
import { themeColours } from '../../tokens/global.tokens';
import {
  localeSwitcherVars,
  logoVars,
} from '../../tokens/menu.tokens';
import borders from '../helpers/borders.helper';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { relativeFontWeight } from '../helpers/typography.helper';
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
  alignItems: 'center',
  justifyContent: 'center',
  width: localeSwitcherVars.width.css(),
  height: localeSwitcherVars.height.css(),
  top: localeSwitcherVars.offsetY.css(),
  right: localeSwitcherVars.offsetX.css(),
  color: localeSwitcherVars.color.css(),
});

export const localeLink = style({
  fontSize: localeSwitcherVars.fontSize.css(),
  ...fontStylesFromFontVariant({
    variant: menuFontVariants.menu,
  }),
  ...relativeFontWeight(menuFontVariants.menu, mPercent(50)),
  pointerEvents: 'auto',
  lineHeight: 1,
  textShadow: `0 0 2px ${localeSwitcherVars.shadow.css()}`,
  opacity: 0.8,
  transition: 'opacity 0.2s ease-out',
  selectors: {
    '&:hover, &:focus-visible, &:focus': {
      opacity: 1,
    },
  },
});

// export const localeChanger = style({
//   ...absolutePosition.topRight(
//     m(0),
//     menuVars.paddings.horizontal.half(),
//   ),
//   display: 'flex',
//   alignContent: 'center',
//   height: `${archVars.top.add(archVars.curveHeight).css()}`,
//   ...fontStylesFromFontVariant(fontVariants.menu, {
//     options: {
//       weightPercents: {
//         default: mPercent(50),
//       },
//     },
//   }),
//   lineHeight: 1,
//   textDecoration: 'none',
//   zIndex: 1,
//   textShadow: `2px 2px 3px ${colorVars.navBg.css()}`,
// });

// export const localeLink = style({
//   position: 'relative',
//   top: menuVars.locale.offsetY.css(),
//   color: menuVars.text.color.css(),
//   alignSelf: 'center',
//   transition: 'opacity 0.2s ease-in',
//   opacity: menuVars.locale.opacity,
//   display: 'inline-grid',
//   gridTemplateAreas: 'stack',
//   alignItems: 'center',
//   transform: transforms.value({
//     skew: {
//       x: menuVars.rotationMax.negation(),
//     },
//   }),
//   selectors: {
//     '&:hover, &:focus-visible': {
//       opacity: 1,
//       textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
//       // menuVars.textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
//     },
//     '&:visited': {
//       color: menuVars.text.color.css(),
//     },
//   },
// });
