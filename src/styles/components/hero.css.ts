import { globalStyle, style } from '@vanilla-extract/css';
import { m, mEm, mPercent } from 'css-calipers';

import { fontFamilies } from '../../tokens/fontFamilies.tokens';
import { colorVars, themeColours } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import {
  heroGradient,
  heroVars,
} from '../componentTokens/hero.component.tokens';
import borders from '../helpers/borders.helper';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { color } from '../helpers/colorWrap.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { fullSizeOfParent } from '../helpers/positioning.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { relativeFontWeight } from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

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
  width: '100%',
  height: [
    '100vh',
    '100dvh',
  ],
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

export const contentWrap = style({
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

export const glassySurfaceOverwrite = style({
  ...makeGlassSurface({
    blur: m(15),
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const fullGradient = style({
  ...fullSizeOfParent(),
  position: 'relative',
  pointerEvents: 'none',
  ...makeCardGradient(heroGradient, {
    linearDirection: m(145, 'deg'),
  }),
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
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const main = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  ...paddings({
    vertical: m(100),
  }),
});

export const subtitle = style({
  opacity: 0,
  textAlign: 'center',
  fontSize: '22px',
  lineHeight: 1.3,
  ...margins({
    top: mEm(1),
  }),
  selectors: {
    '&[data-ready="true"]': {
      opacity: 1,
    },
  },
});

export const titleAsSvg = style({
  display: 'block',
  width: '100%',
  height: 'auto',
});

export const subtitleMarkdown = style({});

globalStyle(`.${subtitleMarkdown} p`, {
  fontSize: '22px',
  margin: 0,
});

// box-shadow: 3px 3px 6px #b8b9be, -3px -3px 6px #fff;

// const ctaGradient = buildLinear({
//   angle: m(110, 'deg'),
//   stops: [
//     { color: themeColours.secondary, at: mPercent(0) },
//     { color: themeColours.brandMix, at: mPercent(50) },
//     { color: themeColours.secondary, at: mPercent(100) },
//   ],
// });

export const cta = style({
  position: 'relative',
  ...margins({ top: m(40) }),
  fontSize: '22px',
  lineHeight: 1,
  ...relativeFontWeight(fontFamilies.objectSans, mPercent(0)),
  ...paddings({
    vertical: m(6),
    horizontal: m(8),
  }),
  ...borders.radii({
    radius: m(12),
  }),
  color: colorVars.black.lighten(0.1).css(),
  textDecoration: 'none',
  // ...boxShadow({
  //   x: m(0),
  //   y: m(1),
  //   blur: m(4),
  //   alpha: 0.15,
  //   color: colorVars.black,
  // }),
  // 3px 3px 6px #b8b9be, -3px -3px 6px #fff
  // ...boxShadow([
  //   {
  //     x: m(3),
  //     y: m(3),
  //     blur: m(6),
  //     color: color('#b8b9be'),
  //   },
  //   {
  //     x: m(-3),
  //     y: m(-3),
  //     blur: m(6),
  //     color: colorVars.white,
  //   },
  // ]),
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    '&:hover, &:focus-visible': {
      // transform: 'translateY(-2px)',
      // ...boxShadow({
      //   x: m(0),
      //   y: m(2),
      //   blur: m(8),
      //   alpha: 0.25,
      //   color: colorVars.black,
      // }),
      // outline: 'none',
    },
    '&[data-ready="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const ctaInner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '30px',
  zIndex: 2,
  ...paddings({
    vertical: m(16),
    horizontal: m(26),
  }),
  ...borders.radii(m(30)),
  ...gradientAsBgImg(
    buildLinear({
      angle: m(0, 'deg'),
      stops: [
        {
          at: mPercent(0),
          color: color('#e7e7e7'),
        },
        {
          at: mPercent(100),
          color: color('#f7f8f7')
            .darken(0.1)
            .mix(themeColours.secondary, 0.1),
        },
      ],
    }),
  ),
});

export const ctaText = style({
  ...gradientAsBgImg(themeColours.gradients.cta),
});

export const ctaIcon = style({
  width: '46px',
  height: '46px',
  ...margins({ right: mEm(0.5) }),
  // selectors: {
  //   [`${cta}:hover &`]: {
  //     transform: 'translateX(6%)',
  //   },
  //   [`${cta}:focus-visible &`]: {
  //     transform: 'translateX(6%)',
  //   },
  // },
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
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const glassPanel = style({
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const glassWrap = style({
  width: '100%',
  position: 'relative',
  zIndex: 1,
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const container = style({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  isolation: 'isolate',
  overflow: 'visible',
  textAlign: 'center',
  maxWidth: '100%',
  width: `clamp(0px, max(70vw, 100vh), ${layoutVars.content.width.css()})`,
});

// export const backdrop = style({
//   position: 'absolute',
//   zIndex: 0,
//   inset: '0 -16px',
//   ...margins({ horizontal: 'auto' }),
//   ...borders.radii(m(28)),
//   backgroundColor: colorVars.black.alpha(0).css(),
//   pointerEvents: 'none',
//   transition: 'none',
// });

// export const panelContents = style({
//   ...paddings(m(80)),
// });

// const heroSurfaceOverlay = buildLinear({
//   angle: glassVars.overlay.direction,
//   stops: [
//     {
//       color: glassVars.overlay.color.alpha(
//         glassVars.overlay.topAlpha,
//       ),
//       at: mPercent(0),
//     },
//     {
//       color: glassVars.overlay.color.alpha(0),
//       at: glassVars.overlay.midStop,
//     },
//     {
//       color: glassVars.overlay.color.alpha(
//         glassVars.overlay.bottomAlpha,
//       ),
//       at: mPercent(100),
//     },
//   ],
// }).modern;

// const heroSurfaceGlow = buildLinear({
//   angle: m(135, 'deg'),
//   stops: [
//     {
//       color: glassVars.surfaceGlowPrimaryTint.alpha(
//         glassVars.surfaceGlow.primaryTintAlpha,
//       ),
//       at: mPercent(0),
//     },
//     {
//       color: glassVars.surfaceGlowSecondaryTint.alpha(
//         glassVars.surfaceGlow.secondaryTintAlpha,
//       ),
//       at: mPercent(100),
//     },
//   ],
// }).modern;

// export const heroSurface = style({
//   background: [
//     heroSurfaceOverlay,
//     heroSurfaceGlow,
//   ].join(', '),
// });

// export const line = style({
//   display: 'inline-block',
//   position: 'relative',
//   zIndex: 1,

//   color: colorVars.white.css(),
//   WebkitTextFillColor: colorVars.white.css(),
//   textShadow: `${dropShadowVars.offsetX.css()} ${dropShadowVars.offsetY.css()} ${dropShadowVars.blur.css()} ${dropShadowVars.color.css()}`,
// });
