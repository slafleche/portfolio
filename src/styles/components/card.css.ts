import { style } from '@vanilla-extract/css';
import { colorVars } from '../vars';

export const cardVars = {};

export const card = style({
  border: 'solid black 10px',
  padding: '10px',
  minHeight: '100px',
  maxWidth: '50vw',
  margin: 'auto',
  background: colorVars.contrastBg.css(),
  color: colorVars.contrastFg.css(),

  //   selectors: {
  //     // pseudo-elements
  //     '&::before': {
  //       content: '""',
  //       ...absolutePosition.topRight(),
  //       width: '100%',
  //       height: '100%',
  //     },
});

export const title = style({});

// Simulate the gradient border from mockup
export const fakeBorder = style({});

// Repeat gradients here so there's a fake "punch out" of the border
export const bgHelper = style({});
