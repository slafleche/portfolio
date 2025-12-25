import { style } from '@vanilla-extract/css';
import { absolutePosition } from '../helpers/positioning.helper';
import { archVars, colorVars } from '../../tokens/global.tokens';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../../tokens/fontVariants.tokens';

import { m, mPercent } from 'css-calipers';
import transforms from '../helpers/transforms.helper';
import { menuVars } from '../componentTokens/menu.componentTokens';

export const localeChanger = style({
  ...absolutePosition.topRight(
    m(0),
    menuVars.paddings.horizontal.half(),
  ),
  display: 'flex',
  alignContent: 'center',
  height: `${archVars.top.add(archVars.curveHeight).css()}`,
  ...composeFontVariantStyles(fontVariants.menu, {
    options: {
      weightPercents: {
        default: mPercent(50),
      },
    },
  }),
  lineHeight: 1,
  textDecoration: 'none',
  zIndex: 1,
  textShadow: `2px 2px 3px ${colorVars.navBg.css()}`,
});

export const localeLink = style({
  position: 'relative',
  top: menuVars.locale.offsetY.css(),
  color: menuVars.text.color.css(),
  alignSelf: 'center',
  transition: 'opacity 0.2s ease-in',
  opacity: menuVars.locale.opacity,
  display: 'inline-grid',
  gridTemplateAreas: 'stack',
  alignItems: 'center',
  transform: transforms.value({
    skew: {
      x: menuVars.rotationMax.negation(),
    },
  }),
  selectors: {
    '&:hover, &:focus-visible': {
      opacity: 1,
      textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
      // menuVars.textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
    },
    '&:visited': {
      color: menuVars.text.color.css(),
    },
  },
});
