import { globalStyle, style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { colorVars, gradients } from '../../tokens/global.tokens';
import { m } from 'css-calipers';
import { margins, paddings } from '../helpers/spacing.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import {
  cardGradient_banq,
  cardGradient_cc,
  cardGradient_ea,
  cardGradient_hs,
  cardGradient_kg,
} from '../componentTokens/card.componentTokens';

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '250px',
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
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: colorVars.transparent.css(),
  height: '100%',
});

export const logoBox = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...paddings(m(40)),
  minWidth: '250px',
});

export const content = style({
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const panel = style({
  flex: 1,
  display: 'flex',
  height: '100%',
});

export const panelSurface = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const panelContent = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const title = style({});
export const text = style({
  ...paddings(m(40)),
});

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

export const gradientKg = style(
  makeCardGradient(cardGradient_kg, {
    linearDirection: m(95, 'deg'),
  }),
);

export const wordmarkTextNoLogo = style({
  selectors: {
    '&[data-position="before"]': {
      ...margins({
        left: m(0.5, 'em'),
      }),
    },
    '&[data-position="after"]': {
      ...margins({
        right: m(0.5, 'em'),
      }),
    },
  },
});

const caseStudyLogoHeight = m(2.1, 'em');
const caseStudyLogoOffset = caseStudyLogoHeight.divide(9.3).round(3);

export const wordMark_vanilla = style({
  display: 'inline-block',
  height: caseStudyLogoHeight.css(),
  transform: `translateY(${caseStudyLogoOffset.css()})`,
  width: 'auto',
  verticalAlign: 'baseline',
});

export const wordMark_cc = style({
  width: '150px',
  height: 'auto',
});

export const wordMark_ea = style({
  width: '150px',
  height: 'auto',
});
export const wordMark_banq = style({
  width: '150px',
  height: 'auto',
});
export const wordMark_hs = style({
  width: '150px',
  height: 'auto',
});
export const wordMark_kg = style({
  width: '150px',
  height: 'auto',
});
