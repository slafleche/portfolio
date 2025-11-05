import { keyframes, style, globalStyle } from '@vanilla-extract/css';
import { logoVars } from '../componentTokens/componentTokens.global';
import { absolutePosition } from '../helpers/positioning';

export const root = style({
  position: 'relative',
});

export const svg = style({
  width: logoVars.width.css(),
  height: 'auto',
  transform: `translateX(-1px)`, // judge it to look visually centered
});

export const shadow = style({
  ...absolutePosition.topLeft(),
  width: logoVars.width.multiply(logoVars.shadowRatio).css(),
  height: 'auto',
});

export const stroke = style({
  strokeOpacity: 1,
  transition: 'stroke 120ms ease-in',
});

const colourIn = keyframes({
  '0%': { opacity: 0 },
  '40%': { opacity: 0 },
  '80%': { opacity: 0.9 },
  '100%': { opacity: 1 },
});

const colourOut = keyframes({
  '0%': { opacity: 1 },
  '40%': { opacity: 0.9 },
  '80%': { opacity: 0 },
  '100%': { opacity: 0 },
});

const strokeIn = keyframes({
  '0%': {
    strokeOpacity: 0,
    strokeWidth: 0,
  },
  '20%': { strokeOpacity: 0.2 },
  '55%': { strokeOpacity: 1 },
  '100%': {
    strokeOpacity: 1,
    strokeWidth: 5.853,
  },
});

const strokeOut = keyframes({
  '0%': {
    strokeOpacity: 1,
    strokeWidth: 5.853,
  },
  '74%': { strokeOpacity: 0.2 },
  '100%': {
    strokeOpacity: 0,
    strokeWidth: 0,
  },
});

export const colourLayer = style({
  opacity: 1,
});

export const monoLayer = style({
  opacity: 0,
});

export const svgStates = style({});

globalStyle(`.${svgStates}[data-color="mono"] .${colourLayer}`, {
  animation: `${colourOut} 560ms ease-out forwards`,
});

globalStyle(`.${svgStates}[data-color="mono"] .${monoLayer}`, {
  animation: `${colourIn} 560ms ease-out forwards`,
});

globalStyle(`.${svgStates}[data-color="mono"] .${stroke}`, {
  animation: `${strokeOut} 560ms ease-out forwards`,
});

globalStyle(
  `.${svgStates}:not([data-color="mono"]) .${colourLayer}`,
  {
    animation: `${colourIn} 780ms ease-out forwards`,
  },
);

globalStyle(`.${svgStates}:not([data-color="mono"]) .${monoLayer}`, {
  animation: `${colourOut} 780ms ease-out forwards`,
});

globalStyle(`.${svgStates}:not([data-color="mono"]) .${stroke}`, {
  animation: `${strokeIn} 780ms ease-out forwards`,
});
