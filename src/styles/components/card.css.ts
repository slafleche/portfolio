import { globalStyle, style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { colorVars, gradients } from '../../tokens/global.tokens';
import { m } from 'css-calipers';
import { paddings } from '../helpers/spacing.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import {
  cardGradient_banq,
  cardGradient_cc,
  cardGradient_ea,
  cardGradient_hs,
  cardGradient_king,
} from '../componentTokens/card.componentTokens';

export const root = style({
  position: 'relative',
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
  overflow: 'hidden',
  backgroundColor: colorVars.transparent.css(),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const content = style({
  position: 'relative',
  zIndex: 2,
  ...paddings(m(40)),
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

export const gradientCC = style(
  makeCardGradient(cardGradient_cc, {
    linearDirection: m(95, 'deg'),
  }),
);
export const gradientEa = style(
  makeCardGradient(cardGradient_ea, {
    linearDirection: m(95, 'deg'),
  }),
);

export const gradientBanq = style(
  makeCardGradient(cardGradient_banq, {
    linearDirection: m(95, 'deg'),
  }),
);

export const gradientHs = style(
  makeCardGradient(cardGradient_hs, {
    linearDirection: m(95, 'deg'),
  }),
);

export const gradientKing = style(
  makeCardGradient(cardGradient_king, {
    linearDirection: m(95, 'deg'),
  }),
);
