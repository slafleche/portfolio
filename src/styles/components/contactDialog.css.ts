import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { colorVars } from '../../tokens/global.tokens';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import { boxShadow } from '../helpers/shadow.helper';
import { backgrounds } from '../helpers/background.helper';
import backdropFilters from '../helpers/backdropFilter.helper';
import borders from '../helpers/borders.helper';
import { margins } from '../helpers/spacing.helper';
import { m } from 'css-calipers';
import {
  absolutePosition,
  fullSizeOfParent,
} from '../helpers/positioning.helper';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { typographyFontVariants } from '../../tokens/fontVariants/typography';

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
  alignItems: 'center',
  // ...paddings({
  //   vertical: m(14),
  //   horizontal: m(10),
  // }),
  ...backgrounds({
    color: colorVars.bodyBg,
  }),
  height: '100%',
  overflowY: 'auto',
});

export const panelContent = style({
  width: 'min(64rem, 90vw)',
  ...margins({
    horizontal: 'auto',
  }),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '6px',
});

export const heading = style({
  margin: 0,
  color: colorVars.white.css(),
  textAlign: 'center',
  fontSize: '50px',
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
  maxWidth: '70ch',
});

const closeOffset = m(8);

export const closeButtonWrap = style({
  position: 'sticky',
  top: closeOffset.css(),
  width: '100%',
  height: 0,
  zIndex: 1,
});

export const closeButton = style({
  ...absolutePosition.topRight(m(0), closeOffset),

  ...margins({
    vertical: m(4),
  }),
  padding: 0,
  alignSelf: 'flex-end',
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
  zIndex: 1,
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
      transform: 'translateY(-2px)',
    },
    '&:focus-visible': {
      outline: 'none',
      ...backgrounds(glassyButtonTokens.focusVisible.backgrounds),
      transform: 'translateY(-2px)',
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
