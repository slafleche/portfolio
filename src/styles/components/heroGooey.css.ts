import { keyframes, style } from '@vanilla-extract/css';
import { fullSizeOfParent } from '../helpers/positioning.helper';

export const blobWrap = style({
  ...fullSizeOfParent(),
  overflow: 'visible',
  pointerEvents: 'none',
});

export const blobField = style({
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'visible',
});

export const blobGroup = style({});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const blobSpin = style({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

export const blobShape = style({
  mixBlendMode: 'normal',
  opacity: 1,
  transformBox: 'view-box',
  transformOrigin: '0 0',
});

// Triangle A
export const triangleA_Animation = style({
  animation: `${spin} 97s linear infinite`,
});

// Triangle B
export const triangleB_Animation = style({
  animation: `${spin} 37s linear infinite reverse`,
});

// Triangle C
export const triangleC_Animation = style({
  animation: `${spin} 29s linear infinite`,
});
