import { style } from '@vanilla-extract/css';
import { makeCardGradients } from '../helpers/card';
import { colorVars, gradientA, gradientB } from '../vars';
import { Color } from 'chroma-js';
import border from '../helpers/border';
import { m } from '../helpers/measurement';
import { absolutePosition } from '../helpers/positioning';
import { globalBoxShadow } from '../helpers/shadow';

export const cardVars = {};

export const card = style({
  border: 'solid black 10px',
  padding: '10px',
  minHeight: '100px',
  maxWidth: '50vw',
  margin: 'auto',
});

export const title = style({});

export const fakeBorder = style({});

export const bgHelper = style({});

export const image = style({
  position: 'relative',
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  width: '200px',
  overflow: 'hidden',
  borderRadius: '50%',
  boxShadow: globalBoxShadow(),
  ...border({
    color: colorVars.bodyFg.css(),
    width: m(6),
  }),
  selectors: {
    '&:after': {
      content: '',
      ...absolutePosition.fullSize(),
      borderRadius: '50%',
      boxShadow: globalBoxShadow({ inset: true }),
    },
  },
});

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
