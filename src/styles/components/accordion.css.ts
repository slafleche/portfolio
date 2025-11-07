import { style, keyframes } from '@vanilla-extract/css';
import {
  backgroundImageDecl,
  buildLinear,
} from '../helpers/gradients.helper';
import {
  glassVars,
  glassyPanelTokens,
} from '../../tokens/glassy.tokens';
import {
  accordionSurfaceTokens,
  accordionItemTokens,
} from '../componentTokens/accordion.componentTokens';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../../tokens/fontVariants.tokens';
import { focusOutline } from '../helpers/focusOutline.helper';
import { colorVars } from '../componentTokens/global.componentTokens';
import { m } from '../measurementKit';
import { borders } from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';

const surfaceGradient = buildLinear({
  angle: accordionSurfaceTokens.gradientAngle,
  stops: accordionSurfaceTokens.gradientStops.map((stop) => ({
    color: stop.color,
    at: stop.at,
  })),
  globalAlpha: accordionSurfaceTokens.gradientOpacity,
});

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

// border-radius: 16px;
// padding: 16px;
// border: 1px solid var(--ring);
// box-shadow: 0 1px 0 hsl(0 0% 100% / .04) inset, 0 10px 30px hsl(0 0% 0% / .35);
// background: linear-gradient(to bottom, hsl(260 40% 10%), hsl(280 40% 14%));

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: accordionItemTokens.gap.css(),
  padding: `${accordionSurfaceTokens.padding.y.css()} ${accordionSurfaceTokens.padding.x.css()}`,
  ...borders(accordionSurfaceTokens.borders),
  boxShadow: boxShadow(glassyPanelTokens.shadow),
  overflow: 'hidden',
  ...backgroundImageDecl(surfaceGradient),
  backgroundColor: glassyPanelTokens.backgroundColor.css(),
  backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
  WebkitBackdropFilter: `blur(${glassVars.backdropBlur.css()})`,
});

export const item = style({
  ...borders(glassyPanelTokens.borders),
  background: 'transparent',
  boxShadow: 'none',
  overflow: 'hidden',
});

export const header = style({
  margin: 0,
});

export const trigger = style({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: m(3).css(),
  width: '100%',
  padding: `${accordionItemTokens.paddingY.css()} ${accordionItemTokens.paddingX.css()}`,
  cursor: 'pointer',
  textAlign: 'left',
  color: colorVars.white.css(),
  transition: 'background-color 180ms ease, transform 180ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: colorVars.white.alpha(0.05).css(),
    },
    '&:focus-visible': {
      backgroundColor: colorVars.white.alpha(0.08).css(),
      ...focusOutline({
        color: colorVars.white.alpha(0.4),
        width: m(0.75),
        offset: m(0.75),
      }),
    },
  },
});

export const triggerLabel = style({
  ...composeFontVariantStyles(fontVariants.h4),
  color: colorVars.white.css(),
  letterSpacing: '0.01em',
});

export const triggerSubtitle = style({
  ...composeFontVariantStyles(fontVariants.body),
  color: colorVars.white.alpha(0.72).css(),
  marginTop: m(1).css(),
});

export const triggerText = style({
  display: 'flex',
  flexDirection: 'column',
  gap: m(1).css(),
});

export const icon = style({
  justifySelf: 'end',
  transition: 'transform 200ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: accordionItemTokens.iconSize.css(),
  height: accordionItemTokens.iconSize.css(),
  borderRadius: '50%',
  backgroundColor: colorVars.white.alpha(0.1).css(),
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
  padding: `${m(3).css()} ${accordionItemTokens.paddingX.css()} ${accordionItemTokens.paddingY.css()}`,
  color: colorVars.white.alpha(0.88).css(),
  lineHeight: 1.6,
});
