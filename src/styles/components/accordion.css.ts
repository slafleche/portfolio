import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { m, mDeg, mPercent } from 'css-calipers';

import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { colorVars } from '../../tokens/global.tokens';
import {
  accordionItemTokens,
  accordionSurfaceTokens,
} from '../componentTokens/accordion.component.tokens';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { outlines } from '../helpers/outlines.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { relativeFontWeight } from '../helpers/typography.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { color } from '../helpers/colorWrap.helper';
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
  ...paddings(accordionItemTokens.handle.paddings),
  ...backgrounds({ color: 'transparent' }),
  border: 'none',
  alignItems: 'center',
  width: '100%',
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
  color: colorVars.white.css(),
  fontSize: '1.5em',
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
  position: 'relative',
  overflow: 'hidden',
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
  ...borders.radii(mPercent(50)),
  ...backgrounds({ color: colorVars.white.alpha(0.1) }),
  selectors: {
    [`.${button}[data-state="open"] &`]: {
      transform: 'rotate(180deg)',
    },
  },
});

export const iconGradient = style({
  ...absolutePosition.fullSize(),
  ...gradientAsBgImg(
    buildLinear({
      angle: mDeg(145),
      stops: [
        {
          color: color('#cacaca').darken(0.6),
          at: mPercent(0),
        },
        {
          color: color('#f0f0f0'),
          at: mPercent(100),
        },
      ],
    }),
  ),
});

export const iconSvg = style({
  display: 'block',
  width: '65%',
  height: '65%',
});

export const content = style({
  overflow: 'hidden',
  color: accordionItemTokens.content.color,
  ...backgrounds({
    color: accordionItemTokens.content.backgroundColor,
  }),
  ...paddings(accordionItemTokens.content.paddings),
  ...relativeFontWeight(typographyFontVariants.body, mPercent(80)),
  selectors: {
    '&[data-state="open"]': {
      animation: `${slideDown} 220ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
    },
    '&[data-state="closed"]': {
      animation: `${slideUp} 180ms cubic-bezier(0.5, 0, 0.75, 0.2) forwards`,
    },
  },
});

export const contentInner = style({});
