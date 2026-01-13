import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { fontFamilies } from '../../tokens/fontFamilies.tokens';
import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import {
  colors,
  colorVars,
  themeColours,
} from '../../tokens/global.tokens';
import backdropFilters from '../helpers/backdropFilter.helper';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { fullSizeOfParent } from '../helpers/positioning.helper';
import { boxShadow, textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  fontStylesFromFontVariant,
  relativeFontWeight,
} from '../helpers/typography.helper';
import * as l from '../layout.css';
import { roundRadius } from './contactButton.vars';

const closeOffset = m(16);
const headerStackHeight = glassyButtonTokens.size.add(
  closeOffset.double(),
);

const sheenSweep = keyframes({
  '0%': {
    transform: 'skewX(45deg) translateX(220%)',
  },
  '100%': {
    transform: 'skewX(45deg) translateX(-220%)',
  },
});

const sheenGradient =
  'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 100%)';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: colorVars.navBg.alpha(0.7).css(),
  zIndex: 1000,
});

export const content = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'stretch',
  padding: 0,
  color: colorVars.bodyFg.css(),
  zIndex: 1001,
});

export const panel = style({
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  ...paddings({
    top: m(0),
  }),
  ...backgrounds({
    color: colorVars.bodyBg,
  }),
  height: '100%',
  overflow: 'hidden',
  minHeight: 0,
});

export const panelContent = style({
  textAlign: 'center',
  display: 'grid',
  gridTemplateRows: '1fr',
  gridTemplateColumns: '1fr',
  alignItems: 'stretch',
  flex: 1,
  minHeight: 0,
  width: '100%',
  ...margins({
    bottom: 0,
  }),
});

globalStyle(`.${panelContent}.${l.content}`, {
  ...paddings({
    horizontal: m(0),
  }),
});

export const glassPanel = style({
  width: '100%',
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const glassContent = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
  height: '100%',
});

export const glassSurface = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
});

export const header = style({
  position: 'sticky',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 2,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: headerStackHeight.css(),
  paddingLeft: closeOffset.css(),
  paddingRight: closeOffset.css(),
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
  ...backdropFilters({
    blur: m(2),
    saturate: mPercent(100),
    contrast: mPercent(100),
    brightness: mPercent(100),
    backgroundColor: colors.transparent,
  }),
  gridRow: 1,
  gridColumn: 1,
});

export const heading = style({
  justifySelf: 'center',
  margin: 0,
  color: colorVars.white.css(),
  // minHeight: headerStackHeight.css(),
  textAlign: 'center',
  fontSize: '50px',
  ...paddings({
    vertical: m(0),
    horizontal: m(80),
  }),
});

globalStyle(`.${heading}[data-modal="title"]`, {
  ...margins(m(0)),
  ...paddings({
    top: m(0),
  }),
  ...relativeFontWeight(fontFamilies.objectSans, mPercent(80)),
  fontSize: '1.2em',
  lineHeight: 1.2,
});

export const body = style({
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.body,
  }),
  ...margins({
    top: m(4),
    horizontal: 'auto',
  }),
  color: colorVars.white.alpha(0.9).css(),
});

export const scrollArea = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  scrollbarGutter: 'stable',
  position: 'relative',
  ...backgrounds({
    color: colors.white.alpha(0.02),
  }),
  gridRow: 1,
  gridColumn: 1,
  zIndex: 1,
  ...backdropFilters({
    blur: m(3),
    saturate: mPercent(110),
    contrast: mPercent(110),
    brightness: mPercent(110),
    backgroundColor: colors.transparent,
  }),
});

export const closeButtonWrap = style({
  position: 'absolute',
  right: closeOffset.css(),
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: glassyButtonTokens.size.css(),
  height: glassyButtonTokens.size.css(),
  zIndex: 2,
});

export const closeButton = style({
  width: glassyButtonTokens.size.css(),
  height: glassyButtonTokens.size.css(),
  ...borders(glassyButtonTokens.borders),
  ...backgrounds(glassyButtonTokens.backgrounds),
  color: glassyButtonTokens.text.color.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  ...boxShadow(glassyButtonTokens.boxShadows),
  ...backdropFilters.style({ blur: glassyButtonTokens.blur }),
  transition:
    'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
  overflow: 'hidden',
  zIndex: 2,
  selectors: {
    '&::after': {
      content: '',
      position: 'absolute',
      inset: '-25%',
      background: sheenGradient,
      transform: 'skewX(45deg) translateX(220%)',
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity 180ms ease',
    },
    '&:hover': {
      ...backgrounds(glassyButtonTokens.hover.backgrounds),
      ...boxShadow(glassyButtonTokens.hover.boxShadows),
      // transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      ...boxShadow(glassyButtonTokens.active.boxShadows),
    },
    '&:hover::after, &:focus-visible::after': {
      opacity: 1,
      animation: `${sheenSweep} 520ms ease`,
    },
    '&:active::after': {
      opacity: 0,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&::after': {
          animation: 'none',
          transform: 'skewX(45deg) translateX(220%)',
          opacity: 0,
        },
        '&:hover::after': {
          animation: 'none',
          transform: 'skewX(45deg) translateX(220%)',
          opacity: 0,
        },
        '&:focus-visible::after': {
          animation: 'none',
          transform: 'skewX(45deg) translateX(220%)',
          opacity: 0,
        },
      },
    },
  },
});

export const scoopGradient = style({
  position: 'absolute',
  inset: '2px',
  ...borders.radii(roundRadius),
  pointerEvents: 'none',
  ...gradientAsBgImg(buildLinear(themeColours.gradients.buttonScoop)),
});

globalStyle(`.${panel} p`, {
  ...margins({
    vertical: m(3),
  }),
});

export const bgImage = style({
  ...fullSizeOfParent(),
  position: 'fixed',
  zIndex: 0,
  inset: 0,
  pointerEvents: 'none',
  objectFit: 'cover',
  mixBlendMode: 'screen',
});
