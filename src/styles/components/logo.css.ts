import { keyframes, style, globalStyle } from '@vanilla-extract/css';

export const core = style({
  width: '85%',
  height: 'auto',
  display: 'block',
  transform: `translateY(-3.5%)`,
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

export const colourLayer = style({
  opacity: 1,
});

export const monoLayer = style({
  opacity: 0,
});

export const svgStates = style({});

// Mono animates; color stays static (no transitions/animations)
globalStyle(`.${svgStates}[data-animate="mono"] .${colourLayer}`, {
  opacity: 0,
  animation: 'none',
});

globalStyle(`.${svgStates}[data-animate="mono"] .${monoLayer}`, {
  animation: 'none',
  opacity: 1,
});

globalStyle(`.${svgStates}[data-animate="mono"] .${stroke}`, {
  animation: 'none',
});

globalStyle(`.${svgStates}[data-animate="color"] .${colourLayer}`, {
  animation: `${colourIn} 780ms ease-out forwards`,
});

globalStyle(`.${svgStates}[data-animate="color"] .${monoLayer}`, {
  animation: `${colourOut} 780ms ease-out forwards`,
});

globalStyle(`.${svgStates}[data-animate="color"] .${stroke}`, {
  animation: `${strokeIn} 780ms ease-out forwards`,
});

globalStyle(`.${svgStates}[data-animate="color"] .${colourLayer}`, {
  opacity: 1,
  animation: 'none',
});

globalStyle(`.${svgStates}[data-animate="color"] .${monoLayer}`, {
  opacity: 0,
  animation: 'none',
});

globalStyle(`.${svgStates}[data-animate="color"] .${stroke}`, {
  animation: 'none',
});
