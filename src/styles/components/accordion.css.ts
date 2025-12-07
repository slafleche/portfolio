import { style, keyframes } from '@vanilla-extract/css';
import {
  backgroundImageDecl,
  buildLinear,
} from '../helpers/gradients.helper';
import { backgrounds } from '../helpers/background.helper';
import {
  glassVars,
  glassyPanelTokens,
} from '../../tokens/glassy.tokens';
import {
  accordionSurfaceTokens,
  accordionItemTokens,
} from '../componentTokens/accordion.componentTokens';
import { fontVariantStyles } from '../../tokens/fontVariants.tokens';
import { outlines } from '../helpers/outlines.helper';
import { colorVars } from '../../tokens/global.tokens';
import { m, mPercent } from 'css-calipers';
import { borders } from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { paddings } from '../helpers/spacing.helper';
import backdropFilters from '../helpers/backdropFilter.helper';

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

// border-radius: 16px;
// padding: 16px;
// border: 1px solid var(--ring);
// box-shadow: 0 1px 0 hsl(0 0% 100% / .04) inset, 0 10px 30px hsl(0 0% 0% / .35);
// background: linear-gradient(to bottom, hsl(260 40% 10%), hsl(280 40% 14%));

export const accordion = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: accordionItemTokens.gap.css(),
  overflow: 'hidden',
  boxShadow: boxShadow(glassyPanelTokens.shadow),
  ...paddings(accordionSurfaceTokens.paddings),
  ...borders(accordionSurfaceTokens.borders),
  ...backgroundImageDecl(surfaceGradient),
  ...backgrounds(glassyPanelTokens.backgrounds),
  ...backdropFilters.style({ blur: glassVars.blur }),
});

export const item = style({
  ...borders(glassyPanelTokens.borders),
  ...backgrounds({ color: 'transparent' }),
  boxShadow: 'none',
  overflow: 'hidden',
});

export const header = style({
  margin: 0,
});

export const trigger = style({
  appearance: 'none',
  ...backgrounds({ color: 'transparent' }),
  border: 'none',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: '3px',
  width: '100%',
  padding: `${accordionItemTokens.paddingY.css()} ${accordionItemTokens.paddingX.css()}`,
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

export const triggerLabel = style({
  ...fontVariantStyles('h4'),
  color: colorVars.white.css(),
});

export const triggerSubtitle = style({
  ...fontVariantStyles('body'),
  color: colorVars.white.alpha(0.72).css(),
});

export const triggerText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
});

export const icon = style({
  justifySelf: 'end',
  transition: 'transform 200ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: accordionItemTokens.iconSize.css(),
  height: accordionItemTokens.iconSize.css(),
  ...borders.radii({ radius: mPercent(50) }),
  ...backgrounds({ color: colorVars.white.alpha(0.1) }),
  selectors: {
    [`${trigger}[data-state="open"] &`]: {
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
  padding: `3px ${accordionItemTokens.paddingX.css()} ${accordionItemTokens.paddingY.css()}`,
  color: colorVars.white.alpha(0.88).css(),
  lineHeight: 1.6,
});
