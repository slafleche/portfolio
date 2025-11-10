import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { colorVars } from '../componentTokens/global.componentTokens';
import { m } from '../measurementKit';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../../tokens/fontVariants.tokens';
import {
  glassVars,
  glassyButtonTokens,
} from '../../tokens/glassy.tokens';
import { boxShadow } from '../helpers/shadow.helper';
import borders from '../helpers/borders.helper';
import { backgrounds } from '../helpers/background.helper';
import backdropFilters from '../helpers/backdropFilter.helper';

const sheenSweep = keyframes({
  '0%': {
    transform: 'skewX(45deg) translateX(220%)',
  },
  '100%': {
    transform: 'skewX(45deg) translateX(-220%)',
  },
});

const sheenGradient =
  'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 100%)';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: colorVars.navBg.alpha(0.7).css(),
  ...backdropFilters.style({ blur: m(24) }),
  zIndex: 1000,
});

export const content = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'stretch',
  padding: 0,
  color: colorVars.bodyFg.css(),
  zIndex: 1001,
});

export const panel = style({
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: `${m(14).css()} ${m(10).css()}`,
  background:
    'linear-gradient(180deg, rgba(20,16,48,0.94) 0%, rgba(15,11,36,0.92) 100%)',
  boxShadow: `0 ${m(3).css()} ${m(12).css()} ${colorVars.black.alpha(0.4).css()}`,
  borderRadius: 0,
  height: '100%',
  overflowY: 'auto',
});

export const panelContent = style({
  width: 'min(64rem, 90vw)',
  margin: '0 auto',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: m(6).css(),
});

export const heading = style({
  margin: 0,
  color: colorVars.white.css(),
  textAlign: 'center',
  ...composeFontVariantStyles(fontVariants.hero),
});

export const body = style({
  marginTop: m(4).css(),
  ...composeFontVariantStyles(fontVariants.body),
  color: colorVars.white.alpha(0.9).css(),
  maxWidth: '70ch',
  marginLeft: 'auto',
  marginRight: 'auto',
});

export const closeButton = style({
  position: 'sticky',
  top: m(6).css(),
  marginTop: m(4).css(),
  marginBottom: m(4).css(),
  alignSelf: 'flex-end',
  width: glassyButtonTokens.size.css(),
  height: glassyButtonTokens.size.css(),
  ...borders(glassyButtonTokens.borders),
  ...backgrounds(glassyButtonTokens.backgrounds),
  color: glassyButtonTokens.text.color.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: glassyButtonTokens.iconSize.css(),
  fontWeight: 600,
  boxShadow: boxShadow(glassyButtonTokens.boxShadows),
  ...backdropFilters.style({ blur: glassVars.blur }),
  transition:
    'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
  overflow: 'hidden',
  zIndex: 1,
  selectors: {
    '&::after': {
      content: '',
      position: 'absolute',
      inset: '-25%',
      background: sheenGradient,
      transform: 'skewX(45deg) translateX(220%)',
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity 180ms ease',
    },
    '&:hover': {
      ...backgrounds(glassyButtonTokens.hover.backgrounds),
      boxShadow: boxShadow(glassyButtonTokens.hover.boxShadows),
      transform: 'translateY(-2px)',
    },
    '&:focus-visible': {
      outline: 'none',
      ...backgrounds(glassyButtonTokens.focusVisible.backgrounds),
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: boxShadow(glassyButtonTokens.active.boxShadows),
    },
    '&:hover::after, &:focus-visible::after': {
      opacity: 1,
      animation: `${sheenSweep} 520ms ease`,
    },
    '&:active::after': {
      opacity: 0,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&::after': {
          animation: 'none',
          transform: 'skewX(45deg) translateX(220%)',
          opacity: 0,
        },
        '&:hover::after': {
          animation: 'none',
          transform: 'skewX(45deg) translateX(220%)',
          opacity: 0,
        },
        '&:focus-visible::after': {
          animation: 'none',
          transform: 'skewX(45deg) translateX(220%)',
          opacity: 0,
        },
      },
    },
  },
});

globalStyle(`.${panel} p`, {
  margin: `${m(3).css()} 0`,
});
