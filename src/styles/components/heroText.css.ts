import { style, globalStyle } from '@vanilla-extract/css';
import { colorVars } from '../../tokens/global.tokens';
import { m } from 'css-calipers';
import { projectorVars } from '../componentTokens/projector.componentTokens';

export const container = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  isolation: 'isolate',
  overflow: 'visible',
  textAlign: 'center',
});

export const backdrop = style({
  position: 'absolute',
  zIndex: 0,
  inset: `0 ${m(-16).css()}`,
  margin: '0 auto',
  borderRadius: m(28).css(),
  backgroundColor: colorVars.black.alpha(0).css(),
  pointerEvents: 'none',
  transition: 'none',
});

export const layer = style({
  position: 'relative',
  display: 'block',
  width: '100%',
});

export const ghost = style({
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  pointerEvents: 'none',
  display: 'block',
  mixBlendMode: 'screen',
  transformOrigin: '50% 50%',
  isolation: 'isolate',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      display: 'none !important',
    },
  },
});

export const channel = style({
  position: 'absolute',
  inset: 0,
  display: 'block',
  pointerEvents: 'none',
  transformOrigin: '50% 50%',
  mixBlendMode: 'screen',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      display: 'none !important',
    },
  },
});

globalStyle(`.${channel} [data-text]`, {
  backgroundImage: 'none',
  color: 'currentColor',
  WebkitTextFillColor: 'currentColor',
  backgroundClip: 'border-box',
  WebkitBackgroundClip: 'border-box',
});

export const channelBlue = style({
  color: projectorVars.colors.blue.css(),
});

export const channelRed = style({
  color: projectorVars.colors.red.css(),
});

export const channelGreen = style({
  color: projectorVars.colors.green.css(),
});

export const master = style({
  zIndex: 2,
  display: 'block',
  textShadow: `${projectorVars.textShadow.offsetX.css()} ${projectorVars.textShadow.offsetY.css()} ${projectorVars.textShadow.blur.css()} ${projectorVars.textShadow.color.css()}`,
});

export const staticHeading = style({
  opacity: 0,
  transition: 'opacity 280ms ease',
  selectors: {
    '&[data-static-ready="true"]': {
      opacity: 1,
    },
  },
});
