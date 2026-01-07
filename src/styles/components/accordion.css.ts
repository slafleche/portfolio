import { style, keyframes, globalStyle } from '@vanilla-extract/css';
import {
  gradientAsBgImg,
  buildLinear,
} from '../helpers/gradients.helper';
import { backgrounds } from '../helpers/background.helper';
import {
  accordionSurfaceTokens,
  accordionItemTokens,
} from '../componentTokens/accordion.component.tokens';
import { outlines } from '../helpers/outlines.helper';
import { colorVars } from '../../tokens/global.tokens';
import { m, mPercent } from 'css-calipers';
import { borders } from '../helpers/borders.helper';
import { margins, paddings } from '../helpers/spacing.helper';
// import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
// import { bodyVariants, headingVariants } from '../../tokens/fontVariants/typography';

const surfaceGradient = buildLinear({
  angle: accordionSurfaceTokens.gradientAngle,
  stops: accordionSurfaceTokens.gradientStops.map((stop) => ({
    color: stop.color,
    at: stop.at,
  })),
  globalAlpha: accordionSurfaceTokens.gradientOpacity,
});

// Radix injects --radix-accordion-content-height at runtime for its collision-free height measurements.
const slideDown = keyframes({
  from: {
    height: 0,
    opacity: 0,
  },
  to: {
    height: 'var(--radix-accordion-content-height)',
    opacity: 1,
  },
});

const slideUp = keyframes({
  from: {
    height: 'var(--radix-accordion-content-height)',
    opacity: 1,
  },
  to: {
    height: 0,
    opacity: 0,
  },
});

export const root = style({});
export const intro = style({});

globalStyle(`.${intro} p`, {
  marginTop: 0,
});

// border-radius: 16px;
// padding: 16px;
// border: 1px solid var(--ring);
// box-shadow: 0 1px 0 hsl(0 0% 100% / .04) inset, 0 10px 30px hsl(0 0% 0% / .35);
// background: linear-gradient(to bottom, hsl(260 40% 10%), hsl(280 40% 14%));

export const accordion = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  // ...paddings(accordionSurfaceTokens.paddings),
  ...borders(accordionSurfaceTokens.borders),
  ...gradientAsBgImg(surfaceGradient),
});

export const item = style({
  boxShadow: 'none',
  overflow: 'hidden',
});

export const header = style({
  margin: 0,
});

export const button = style({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  appearance: 'none',
  ...backgrounds({ color: 'transparent' }),
  border: 'none',
  alignItems: 'center',
  width: '100%',
  // ...paddings(accordionItemTokens.paddings),
  cursor: 'pointer',
  textAlign: 'left',
  color: colorVars.white.css(),
  transition: 'background-color 180ms ease, transform 180ms ease',
  selectors: {
    '&:hover': {
      ...backgrounds({ color: colorVars.white.alpha(0.05) }),
    },
    '&:focus-visible': {
      ...backgrounds({ color: colorVars.white.alpha(0.08) }),
      ...outlines({
        color: colorVars.white.alpha(0.4),
        width: m(0.75),
        offset: m(0.75),
      }),
    },
  },
});

export const triggerText = style({
  ...paddings({
    right: m(8),
  }),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const triggerLabel = style({
  // ...fontStylesFromFontVariant(headingVariants.h4),
  color: colorVars.white.css(),
  ...paddings({
    right: accordionItemTokens.handle.spacing,
  }),
});

export const rightArrow = style({
  width: accordionItemTokens.rightArrow.size.css(),
  height: 'auto',
  color: accordionItemTokens.rightArrow.color.css(),
  ...paddings({
    right: accordionItemTokens.handle.spacing,
  }),
});

export const triggerSubtitle = style({
  //
  color: colorVars.white.alpha(0.72).css(),
});

export const icon = style({
  ...margins({
    left: 'auto',
  }),
  justifySelf: 'end',
  transition: 'transform 200ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: accordionItemTokens.chevronSize.css(),
  height: accordionItemTokens.chevronSize.css(),
  ...borders.radii({ radius: mPercent(50) }),
  ...backgrounds({ color: colorVars.white.alpha(0.1) }),
  selectors: {
    [`.${button}[data-state="open"] &`]: {
      transform: 'rotate(180deg)',
    },
  },
});

export const iconSvg = style({
  display: 'block',
  width: '65%',
  height: '65%',
});

export const content = style({
  // ...backgrounds(accordionSurfaceTokens.drawerBackgrounds),
  overflow: 'hidden',
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideDown} 220ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
    },
    '&[data-state="closed"]': {
      animation: `${slideUp} 180ms cubic-bezier(0.5, 0, 0.75, 0.2) forwards`,
    },
  },
});

export const contentInner = style({
  // ...paddings(accordionItemTokens.paddings),
  color: colorVars.white.alpha(0.88).css(),
  lineHeight: 1.6,
});
