import { keyframes, style } from '@vanilla-extract/css';
import { paddings } from '../helpers/spacing';
import { layoutVars } from '../componentTokens/componentTokens.layout';
import { m } from '../measurementKit';
import { colorVars } from '../componentTokens/componentTokens.global';
import {
  glassVars,
  glassyActionTokens,
} from '../helpers/glassy';

export const container = style({
  position: 'relative',
  width: '100%',
  maxWidth: layoutVars.contentWidth.css(),
  margin: '0 auto',
  ...paddings({
    horizontal: layoutVars.contentPadding,
  }),
  paddingTop: m(36).css(),
  paddingBottom: m(48).css(),
  display: 'grid',
  gap: m(24).css(),
});

export const header = style({
  display: 'grid',
  gap: m(8).css(),
});

export const title = style({
  margin: 0,
  fontSize: 'clamp(2.25rem, 5vw, 3rem)',
  fontWeight: 700,
  color: colorVars.white.css(),
});

export const updated = style({
  margin: 0,
  color: colorVars.white.alpha(0.65).css(),
  fontSize: '0.95rem',
});

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

export const backLink = style({
  position: 'absolute',
  top: m(12).css(),
  right: m(12).css(),
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
  boxShadow: glassyActionTokens.shadowRest,
  backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  WebkitBackdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  transition: glassyActionTokens.transition,
  textDecoration: 'none',
  overflow: 'hidden',
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
});
