import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { colorVars } from '../componentTokens/componentTokens.global';
import { m } from '../measurementKit';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../../tokens/fontVariants.tokens';
import {
  glassVars,
  glassyActionTokens,
} from '../helpers/glassy';

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
  backdropFilter: 'blur(24px)',
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
  justifyContent: 'center',
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
  position: 'absolute',
  top: m(6).css(),
  right: m(6).css(),
  width: glassyActionTokens.size.css(),
  height: glassyActionTokens.size.css(),
  borderRadius: glassyActionTokens.borderRadius.css(),
  border: `${glassyActionTokens.borderWidth.css()} solid ${glassyActionTokens.borderColor.css()}`,
  background: glassyActionTokens.background.css(),
  color: glassyActionTokens.textColor.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: glassyActionTokens.iconSize.css(),
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: glassyActionTokens.shadowRest,
  backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  WebkitBackdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  transition: glassyActionTokens.transition,
  overflow: 'hidden',
  position: 'absolute',
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
      background: glassyActionTokens.hoverBackground.css(),
      boxShadow: glassyActionTokens.shadowHover,
      transform: 'translateY(-2px)',
    },
    '&:focus-visible': {
      outline: 'none',
      background: glassyActionTokens.hoverBackground.css(),
      boxShadow: `${glassyActionTokens.shadowHover}, 0 0 0 ${glassyActionTokens.focusRingWidth.css()} ${glassyActionTokens.focusRingColor.css()}`,
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: glassyActionTokens.shadowRest,
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
