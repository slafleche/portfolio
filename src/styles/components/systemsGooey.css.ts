import { globalStyle, keyframes, style } from '@vanilla-extract/css';

const fadeIn = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

export const root = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  overflow: 'visible',
  pointerEvents: 'none',
  height: '120vh',
});

export const blobField = style({
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
});

export const blobGroup = style({});


export const blobSpin = style({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

export const blobShape = style({
  mixBlendMode: 'normal',
  opacity: 0,
  transformBox: 'fill-box',
  transformOrigin: 'center',
  animation: `${fadeIn} 900ms ease-out forwards`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      opacity: 1,
    },
  },
});

globalStyle(`${root} [data-triangle="a"]`, {
  animationDelay: '0ms',
});

globalStyle(`${root} [data-triangle="b"]`, {
  animationDelay: '160ms',
});

globalStyle(`${root} [data-triangle="c"]`, {
  animationDelay: '320ms',
});
