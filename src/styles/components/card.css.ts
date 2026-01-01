import { globalStyle, style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { colorVars, gradients } from '../../tokens/global.tokens';
import { m } from 'css-calipers';
import { margins, paddings } from '../helpers/spacing.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { cardColours } from '../componentTokens/card.componentTokens';
import { glassVars } from '../../tokens/glassy.tokens';

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
  // filter: 'blur(2px)',
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
  makeCardGradient(cardColours.gradients.cc, {
    linearDirection: m(95, 'deg'),
  }),
);
export const gradientEa = style(
  makeCardGradient(cardColours.gradients.ea, {
    linearDirection: m(95, 'deg'),
  }),
);

export const gradientBanq = style(
  makeCardGradient(cardColours.gradients.banq, {
    linearDirection: m(95, 'deg'),
  }),
);

export const gradientHs = style(
  makeCardGradient(cardColours.gradients.hs, {
    linearDirection: m(95, 'deg'),
  }),
);

export const gradientKg = style(
  makeCardGradient(cardColours.gradients.kg, {
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

export const logoAsBg = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'hidden',
});

export const logoAsBgSVG = style({
  position: 'absolute',
  top: '50%',
  left: glassVars.backdropFilter.blur.add(m(5)).css(),
  transformOrigin: '0 100%',
  width: '100%',
  height: 'auto',
  mixBlendMode: 'multiply',
  ...paddings({
    horizontal: m(8),
  }),
});

export const logoAsBg_cc = style({
  width: '110%',
  color: cardColours.logoAsBg.cc.css(),
  transform: 'translate(0, -60%) rotate(4deg)',
});
export const logoAsBg_ea = style({
  width: '100%',
  transform: 'translate(0%, -50%) rotate(4deg)',
  color: cardColours.logoAsBg.ea.css(),
});
export const logoAsBg_banq = style({
  width: '100%',
  transformOrigin: '50% 50%',
  transform: 'translate(-20%, -50%) rotate(4deg) scale(1.9)',
  color: cardColours.logoAsBg.banq.css(),
});
export const logoAsBg_hs = style({
  width: '100%',
  transform: 'translate(0%, -30%) rotate(-14deg) scale(1.1)',
  color: cardColours.logoAsBg.hs.css(),
});
export const logoAsBg_kg = style({
  width: '90%',
  transform:
    'translate(5%, -50%) rotate(-8deg) scaleX(1.2) scaleY(1)',
  color: cardColours.logoAsBg.kg.css(),
});
