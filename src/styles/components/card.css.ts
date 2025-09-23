import { style } from '@vanilla-extract/css';
import { makeCardGradients } from '../helpers/card';
import { gradientA, gradientB } from '../vars';
import nest from '../helpers/nesting';
import { Color } from 'chroma-js';

export const cardVars = {};

export const card = style({
  border: 'solid black 10px',
  padding: '10px',
  minHeight: '100px',
  maxWidth: '50vw',
  margin: 'auto',
  // background: colorVars.contrastBg.css(),
  // color: colorVars.contrastFg.css(),

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

export const fakeBorder = style({});

export const bgHelper = style({});

export const cardGradientA = style(
  makeCardGradients({
    spotA: gradientA.overlayA,
    spotB: gradientA.overlayB,
    linearColors: gradientA.linear as [Color, Color, Color],
  }),
);

export const cardGradientB = style(
  makeCardGradients({
    spotA: gradientB.overlayA,
    spotB: gradientB.overlayB,
    linearColors: gradientB.linear as [Color, Color, Color],
  }),
);
