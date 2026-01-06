import { style, globalStyle } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';
import {
  colorVars,
  dropShadowVars,
  themeColours,
} from '../../tokens/global.tokens';
import { heroVars } from '../componentTokens/hero.component.tokens';
import { fullSizeOfParent } from '../helpers/positioning.helper';
import { noiseBg } from '../helpers/noiseSVG.helper';
import { paddings, margins } from '../helpers/spacing.helper';
import borders from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import {
  gradientAsBgImg,
  buildLinear,
} from '../helpers/gradients.helper';
import { glassVars } from '../../tokens/glassy.tokens';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { heroFontVariants } from '../../tokens/fontVariants/hero';
import { makeGlassSurface } from '../helpers/glassy.helper';
import {
  componentMediaQueries,
  mediaQueryStyle,
} from '../responsive/mediaQueries';

/* ============================================================================
   ROOT + MEDIA + OVERLAYS
   ========================================================================== */

const bgGradients = buildLinear({
  stops: heroVars.background.linear,
});

export const root = style({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  minHeight: '100vh',
  overflow: 'hidden',
  isolation: 'isolate',
});

export const image = style({
  ...fullSizeOfParent(),
  zIndex: 0,
  pointerEvents: 'none',
});

globalStyle(`.${image} img`, {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const video = style({
  ...fullSizeOfParent(),
  zIndex: 0,
  inset: 0,
  pointerEvents: 'none',
  objectFit: 'cover',
  // mixBlendMode: 'screen',
});

export const contentWrap = style({
  ...fullSizeOfParent(),
  ...gradientAsBgImg(bgGradients),
});

export const videoBg = style({
  ...fullSizeOfParent(),
  ...gradientAsBgImg(bgGradients),
});

export const visualContent = style({
  ...fullSizeOfParent(),
  position: 'relative',
  opacity: heroVars.background.videoOpacity,
});

export const overlays = style({
  ...fullSizeOfParent(),
  zIndex: 1,
  pointerEvents: 'none',
  position: 'absolute',
  inset: 0,
});

export const glassySurfaceOverwrite = style(
  makeGlassSurface({
    blur: m(15),
  }),
);

/** Subtle static grain to break banding */
export const grain = style({
  ...fullSizeOfParent(),
  ...noiseBg({ opacity: 0.03 }),
});

/** Faint multi-stop wash to even flat backgrounds */
const washTop = colorVars.shadow.alpha(0.3).css();
const washMid = colorVars.white.alpha(0.1).css();
const washBot = colorVars.black.alpha(0.6).css();

export const wash = style({
  ...fullSizeOfParent(),
  backgroundImage: `linear-gradient(180deg, ${washTop} 0%, ${washMid} 45%, ${washBot} 100%)`,
  mixBlendMode: 'soft-light',
  opacity: 0.5,
});

/** Soften center area */
export const centerSoften = style({
  ...fullSizeOfParent(),
  backgroundImage: `radial-gradient(
    140% 100% at 50% 0%,
    ${colorVars.shadow.alpha(1).css()} 0%,
    ${colorVars.shadow.alpha(0.15).css()} 42%,
    ${colorVars.shadow.alpha(0).css()} 70%
  )`,
  opacity: 0.2,
});

/** Break ring radius with soft band */
export const ringBreaker = style({
  ...fullSizeOfParent(),
  backgroundImage: `radial-gradient(
    68% 52% at 50% 60%,
    transparent 0%,
    ${colorVars.black.alpha(0.028).css()} 52%,
    ${colorVars.black.alpha(0.05).css()} 68%,
    ${colorVars.black.alpha(0).css()} 86%
  )`,
});

/* ============================================================================
   CONTENT / PANELS
   ========================================================================== */

export const content = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
});

export const main = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  ...paddings({
    vertical: m(80),
    horizontal: m(46),
  }),
  selectors: {
    ...componentMediaQueries({
      hero_compact: paddings(m(46)),
    }),
  },
});

export const subtitle = style({
  opacity: 0,
  transition: 'opacity 220ms ease',
  textAlign: 'center',
  selectors: {
    '&[data-ready="true"]': {
      opacity: 1,
    },
  },
});

export const subtitleMarkdown = style({});

globalStyle(`.${subtitleMarkdown} p`, {
  fontSize: '22px',
  margin: 0,
});

// export const paragraph = style({
//   position: 'relative',
//   textAlign: 'center',
//   ...fontStylesFromFontVariant(fontVariants.hero, {
//     options: {
//       weightPercents: {
//         default: mPercent(0),
//       },
//     },
//     overrides: {
//       size: undefined,
//     },
//   }),
//   fontSize: '26px',
//   lineHeight: 1,
//   textShadow: `2px 2px 5px ${colorVars.black.css()}`,
//   ...margins({
//     all: 0,
//     top: m(30),
//   }),
// });

const ctaGradient = buildLinear({
  angle: m(110, 'deg'),
  stops: [
    { color: themeColours.secondary, at: mPercent(0) },
    { color: themeColours.brandMix, at: mPercent(50) },
    { color: themeColours.secondary, at: mPercent(100) },
  ],
});

export const cta = style({
  ...margins({ top: m(40) }),
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  justifyContent: 'center',
  alignSelf: 'center',
  ...gradientAsBgImg(ctaGradient),
  ...paddings({
    vertical: m(3),
    horizontal: m(6),
  }),
  ...borders.radii({ radius: m(3) }),

  // backgroundColor: themeColours.brand.css(),
  // backgroundColor: colorVars.white.alpha(0.85).css(),
  color: colorVars.white.css(),
  fontWeight: 600,
  textDecoration: 'none',
  transition:
    'transform 150ms ease, box-shadow 150ms ease, opacity 220ms ease',
  ...boxShadow({
    x: m(0),
    y: m(1),
    blur: m(4),
    alpha: 0.15,
    color: colorVars.black,
  }),
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    '&:hover, &:focus-visible': {
      transform: 'translateY(-2px)',
      ...boxShadow({
        x: m(0),
        y: m(2),
        blur: m(8),
        alpha: 0.25,
        color: colorVars.black,
      }),
      outline: 'none',
    },
    '&[data-ready="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const ctaIcon = style({
  width: '14px',
  height: '14px',
  transition: 'transform 160ms ease',
  selectors: {
    [`${cta}:hover &`]: {
      transform: 'translateX(6%)',
    },
    [`${cta}:focus-visible &`]: {
      transform: 'translateX(6%)',
    },
  },
});

export const vennContainer = style({
  position: 'relative',
  isolation: 'isolate',
  ...paddings(m(80)),
});

export const consolePanel = style({
  position: 'relative',
});

export const panel = style({
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'stretch',
  ...margins({
    horizontal: 'auto',
  }),
});

export const glassWrap = style({
  width: '100%',
  position: 'relative',
  zIndex: 1,
});

export const panelContents = style({
  ...paddings(m(80)),
});

const heroSurfaceOverlay = buildLinear({
  angle: glassVars.overlay.direction,
  stops: [
    {
      color: glassVars.overlay.color.alpha(
        glassVars.overlay.topAlpha,
      ),
      at: mPercent(0),
    },
    {
      color: glassVars.overlay.color.alpha(0),
      at: glassVars.overlay.midStop,
    },
    {
      color: glassVars.overlay.color.alpha(
        glassVars.overlay.bottomAlpha,
      ),
      at: mPercent(100),
    },
  ],
}).modern;

const heroSurfaceGlow = buildLinear({
  angle: m(135, 'deg'),
  stops: [
    {
      color: glassVars.surfaceGlowPrimaryTint.alpha(
        glassVars.surfaceGlow.primaryTintAlpha,
      ),
      at: mPercent(0),
    },
    {
      color: glassVars.surfaceGlowSecondaryTint.alpha(
        glassVars.surfaceGlow.secondaryTintAlpha,
      ),
      at: mPercent(100),
    },
  ],
}).modern;

export const heroSurface = style({
  background: [
    heroSurfaceOverlay,
    heroSurfaceGlow,
  ].join(', '),
});

export const title_break = style({
  selectors: {
    ...mediaQueryStyle({
      noEdge: {
        display: 'none',
      },
    }),
  },
});

export const heading = style({
  position: 'relative',
  textAlign: 'center',
  ...fontStylesFromFontVariant({
    variant: heroFontVariants.hero,
  }),
  fontSize: 'clamp(20px, 8vw, 100px)',
  ...margins({
    top: heroFontVariants.hero.family.offsetToFlushTop,
    bottom: m(40),
  }),
  selectors: {
    ...mediaQueryStyle({
      snug: {
        fontSize: 'clamp(20px, 7vw, 100px)',
      },
    }),
  },
});

/**
 * Text lines — base gradient on the element (static), sheen on
 * ::after (animated). Uses only colorVars.white/black for
 * highlights/shadows. For the sheen to show, set the same text
 * content on a data attribute (data-text="...") so ::after can render
 * it.
 */

export const line = style({
  display: 'inline-block',
  position: 'relative',
  zIndex: 1,

  color: colorVars.white.css(),
  WebkitTextFillColor: colorVars.white.css(),
  textShadow: `${dropShadowVars.offsetX.css()} ${dropShadowVars.offsetY.css()} ${dropShadowVars.blur.css()} ${dropShadowVars.color.css()}`,
});
