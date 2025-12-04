import { globalStyle, style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { colorVars, gradients } from '../../tokens/global.tokens';
import { m } from 'css-calipers';
import { paddings } from '../helpers/spacing.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { glassVars } from '../../tokens/glassy.tokens';
import { borders } from '../helpers/borders.helper';

export const root = style({
  position: 'relative',
  margin: '20px',
  display: 'flex',
  flexDirection: 'column',
  selectors: {
    '&[data-type="left"]': {
      gridColumn: '1',
    },
    '&[data-type="right"]': {
      gridColumn: '3',
    },
  },
});

globalStyle(`.${root}[data-type="right"] *`, {
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
});
globalStyle(`.${root}[data-type="left"] *`, {
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

export const container = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: '24px',
  alignItems: 'stretch',
});

export const frame = style({
  position: 'relative',
  ...borders(glassVars.borders, { allowRadiusOnly: true }),
  overflow: 'hidden',
  backgroundColor: colorVars.transparent.css(),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const content = style({
  position: 'relative',
  zIndex: 2,
  ...paddings({
    all: m(40),
  }),
  ...borders(glassVars.borders, { allowRadiusOnly: true }),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const title = style({});

export const image = style({
  justifySelf: 'center',
  alignSelf: 'center',
  gridColumn: '2',
  position: 'relative',
  display: 'block',
  width: '200px',
  height: 'auto',
  overflow: 'hidden',
});

export const gradient = style({
  ...absolutePosition.fullSize(),
  filter: 'blur(2px)',
  pointerEvents: 'none',
  borderRadius: 'inherit',
  zIndex: 0,
});

export const cardGradientA = style(
  makeCardGradient(gradients[0], {
    // extrasPerSpan: 100,
    linearDirection: m(110, 'deg'),
    // includeLinear: false,
    // includeSpots: false,
  }),
);

export const cardGradientB = style(
  makeCardGradient(gradients[1], {
    linearDirection: m(95, 'deg'),
  }),
);
