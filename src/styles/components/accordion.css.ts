import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { m, mDeg, mPercent } from 'css-calipers';

import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { colorVars, themeColours } from '../../tokens/global.tokens';
import {
  accordionItemTokens,
  accordionSurfaceTokens,
} from '../componentTokens/accordion.component.tokens';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import { color } from '../helpers/colorWrap.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { outlines } from '../helpers/outlines.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { fontStylesFromFontVariant } from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

const slideTokens = accordionItemTokens.animation.slide;

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
export const root = style({
  ...margins({
    bottom: m(64),
  }),
});
export const intro = style({});

globalStyle(`.${intro} p`, {
  marginTop: 0,
});

export const accordion = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  ...borders(accordionSurfaceTokens.borders),
  ...gradientAsBgImg(surfaceGradient),
});

export const item = style({
  boxShadow: 'none',
  overflow: 'hidden',
});

export const separator = style({
  ...borders(accordionSurfaceTokens.drawer.borders),
});

export const header = style({
  margin: 0,
});

export const button = style({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  appearance: 'none',
  cursor: 'pointer',
  ...paddings(accordionItemTokens.button.paddings),
  ...backgrounds({ color: 'transparent' }),
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.body,
    includeFontMargins: true,
  }),
  lineHeight: 1.1,
  border: 'none',
  alignItems: 'center',
  width: '100%',
  textAlign: 'left',
  color: colorVars.white.css(),
  transition: 'background-color 180ms ease, transform 180ms ease',
  selectors: {
    '&:hover': {
      ...backgrounds({ color: colorVars.white.alpha(0.05) }),
    },
    '&:focus-visible': {
      outline: 'none',
    },
    '&:before': {
      content: '""',
      ...absolutePosition.fullSize(),
      pointerEvents: 'none',
      opacity: 0,
      transition: `opacity ${slideTokens.closed.timing.css()} ease-out`,
      ...gradientAsBgImg(
        buildLinear({
          angle: mDeg(0),
          stops: [
            {
              color: accordionItemTokens.content.backgroundColor,
              at: mPercent(0),
            },
            {
              color: color('#200a2e')
                .mix(accordionItemTokens.content.backgroundColor, 0.5)
                .lighten(0.2),
              at: mPercent(100),
            },
          ],
        }),
      ),
    },
    "&[data-state='open']:before": {
      opacity: 1,
    },
    ...mediaQueryStyle({
      compact: {
        fontSize: '15px',
      },
    }),
  },
});

export const triggerText = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  rowGap: '0.5em',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  fontSize: '1.5em',
  lineHeight: 1.1,
  maxWidth: `calc(100% - ${accordionItemTokens.button.size.css()})`,
});

export const triggerLabel = style({
  color: colorVars.white.css(),

  ...paddings({
    right: accordionItemTokens.button.spacing,
  }),
});

export const triggerSubtitle = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  color: colorVars.white.alpha(0.72).css(),
});

export const triggerSubtitleText = style({
  ...margins({
    horizontal: accordionItemTokens.button.spacing,
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...margins({
          horizontal: m(0),
        }),
      },
    }),
  },
});

export const rightArrow = style({
  display: 'block',
  position: 'relative',
  top: '0.5em',
  transform: 'translateY(-50%)',
  color: accordionItemTokens.rightArrow.color.css(),
});

export const iconContainer = style({
  display: 'inline-block',
  minWidth: '1em',
  height: '1em',
  alignSelf: 'center',
  selectors: {
    ...mediaQueryStyle({
      compressed: {
        display: 'none',
      },
    }),
  },
});

export const icon = style({
  position: 'relative',
  overflow: 'hidden',
  ...margins({
    left: 'auto',
  }),
  justifySelf: 'end',
  alignSelf: 'flex-start',
  transition: 'transform 200ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: accordionItemTokens.button.size.css(),
  height: accordionItemTokens.button.size.css(),
  ...borders.radii(mPercent(50)),
  ...backgrounds({ color: colorVars.white.alpha(0.1) }),
});

export const iconGradient = style({
  ...absolutePosition.fullSize(),
  ...gradientAsBgImg(
    buildLinear({
      angle: mDeg(145),
      stops: [
        {
          // color: color('#cacaca').darken(0.6),
          color: themeColours.purples.light,
          at: mPercent(0),
        },
        {
          // color: coldor('#f0f0f0'),
          color: themeColours.purples.light.lighten(0.5),
          at: mPercent(100),
        },
      ],
    }),
  ),
});

export const iconSvg = style({
  position: 'relative',
  display: 'block',
  height: accordionItemTokens.button.size.css(),
  width: accordionItemTokens.button.size.css(),
  transition: `transform ${slideTokens.closed.timing.css()} ${slideTokens.closed.easing}`,
  selectors: {
    '&[data-state="closed"]': {
      transition: `transform ${slideTokens.open.timing.css()} ${slideTokens.open.easing}`,
    },
  },
});

globalStyle(`.${item}[data-state="open"] .${iconSvg}`, {
  transform: 'rotate(45deg)',
});

globalStyle(`.${button}:focus-visible .${icon}`, {
  ...outlines({
    color: themeColours.secondary,
    width: m(2),
  }),
});

export const content = style({
  overflow: 'hidden',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  willChange: 'height, opacity',
  color: accordionItemTokens.content.color,
  ...backgrounds({
    color: accordionItemTokens.content.backgroundColor,
  }),
  ...paddings(accordionItemTokens.content.paddings),
  selectors: {
    '&[data-animated-slide="true"][data-state="open"]': {
      animation: `${slideDown} ${slideTokens.open.timing.css()} ${slideTokens.open.easing} forwards`,
    },
    '&[data-animated-slide="true"][data-state="closed"]': {
      animation: `${slideUp} ${slideTokens.closed.timing.css()} ${slideTokens.closed.easing} forwards`,
    },
  },
});
