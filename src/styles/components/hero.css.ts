import { style, globalStyle } from '@vanilla-extract/css';
import { colorVars } from '../componentTokens/global.componentTokens';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../../tokens/fontVariants.tokens';
import { heroVars } from '../componentTokens/hero.componentTokens';
import { fullSizeOfParent } from '../helpers/positioning.helper';
import { noiseBg } from '../helpers/noiseSVG.helper';
import { surfaceLayers, surfaceBaseColor } from '../glassy.css';
import { m } from '../measurementKit';
import { paddings } from '../helpers/spacing.helper';

import {
  backgroundImageDecl, 
  buildLinear,
} from '../helpers/gradients.helper';
import { projectorVars } from '../componentTokens/projector.componentTokens';

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
  mixBlendMode: 'screen',
});

export const contentWrap = style({
  ...fullSizeOfParent(),
  ...backgroundImageDecl(bgGradients),
});

export const videoBg = style({
  ...fullSizeOfParent(),
  ...backgroundImageDecl(bgGradients),
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
});

export const bridge = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

// export const paragraph = style({
//   position: 'relative',
//   textAlign: 'center',
//   ...composeFontVariantStyles(fontVariants.hero, {
//     options: {
//       weightPercents: {
//         default: mPercent(0),
//       },
//     },
//     overrides: {
//       size: undefined,
//     },
//   }),
//   fontSize: m(26).css(),
//   lineHeight: 1,
//   textShadow: `2px 2px 5px ${colorVars.black.css()}`,
//   ...margins({
//     all: 0,
//     top: m(30),
//   }),
// });

export const cta = style({
  marginTop: m(16).css(),
  display: 'inline-flex',
  alignItems: 'center',
  gap: m(3).css(),
  justifyContent: 'center',
  alignSelf: 'center',
  padding: `${m(3).css()} ${m(6).css()}`,
  borderRadius: m(3).css(),
  backgroundColor: colorVars.white.alpha(0.85).css(),
  color: colorVars.navBg.css(),
  fontWeight: 600,
  textDecoration: 'none',
  transition:
    'transform 150ms ease, box-shadow 150ms ease, opacity 220ms ease',
  boxShadow: `0 ${m(1).css()} ${m(4).css()} rgba(0,0,0,0.15)`,
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    '&:hover, &:focus-visible': {
      transform: 'translateY(-2px)',
      boxShadow: `0 ${m(2).css()} ${m(8).css()} rgba(0,0,0,0.25)`,
      outline: 'none',
    },
    '&[data-ready="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const ctaIcon = style({
  width: m(14).css(),
  height: m(14).css(),
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

// Shared offsets for hero overlap framing.
const offset = m(20);

export const vennContainer = style({
  position: 'relative',
  isolation: 'isolate',
  ...paddings({
    horizontal: offset.multiply(4),
    vertical: offset.multiply(4),
  }),
});

export const consolePanel = style({
  position: 'relative',
});

// export const console = style({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   width: `calc(100% + ${offset.multiply(1.5).css()})`,
//   transform: transforms.value(...consoleTransforms),
//   transformOrigin: '50% 50%',
//   display: 'flex',
//   flexDirection: 'column',
//   overflow: 'hidden',
//   pointerEvents: 'auto',
//   zIndex: 0,
//   minHeight: '55vh',
//   selectors: {
    // '&:after': {
    // 	content: '""',
    // 	position: 'absolute',
    // 	inset: 0,
    // 	background:
    // 		'radial-gradient(34% 28% at 60% 62%, rgba(92,204,229,0.18), transparent 72%)',
    // 	mixBlendMode: 'screen',
    // 	filter: 'blur(10px)',
    // 	pointerEvents: 'none',
    // },
//   },
// });

// export const designPanel = style({
//   transform: transforms.value(...designTransforms),
//   position: 'relative',
//   zIndex: 1,
//   selectors: {
    // '&:after': {
    // 	content: '""',
    // 	position: 'absolute',
    // 	inset: 0,
    // 	background:
    // 		'radial-gradient(30% 24% at 64% 60%, rgba(255,255,255,0.32), transparent 70%)',
    // 	mixBlendMode: 'screen',
    // 	filter: 'blur(12px)',
    // 	pointerEvents: 'none',
    // },
//   },
// });

// export const vennContents = style({
//   transform: transforms.value(
//     transforms.rotate(designRotation.negation()),
//   ),
// });

// export const vennMiddle = style({
// 	padding: offset.multiply(2).css(),
// });

export const panel = style({
  position: 'relative',
  width: 'fit-content',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'center',
  margin: '0 auto',
});

export const panelContents = style({
  ...paddings({
    vertical: m(80),
    horizontal: m(80),
  }),
});

export const heroSurface = style({
  background: [surfaceLayers.overlay, surfaceLayers.glow].join(', '),
  backgroundColor: surfaceBaseColor,
});

export const title_break = style({});

/** Exact colour math from original HTML */
// const TITLE_LEFT = themeColours.lights.a.saturate(0); // Electric blue
// const TITLE_RIGHT = themeColours.lights.b.saturate(0.2); // Pink
// const TITLE_MERGE = themeColours.lights.d.darken(0.2); // Light Purple

/** Identical sweep timing (R→L then idle) — single-layer (::after) */
// const shimmerSweep = keyframes({
// 	'0%': {
// 		backgroundPosition: '120% 50%',
// 	},
// 	'70%': {
// 		backgroundPosition: '-120% 50%',
// 	},
// 	'100%': {
// 		backgroundPosition: '-120% 50%',
// 	},
// });

export const heading = style({
  position: 'relative',
  margin: 0,
  textAlign: 'center',
  ...composeFontVariantStyles(fontVariants.hero),
  fontSize: 'clamp(32px, 7vw, 80px)',
  marginTop: fontVariants.hero.family.offsetToFlushTop?.css(),
  // selectors: {
  // 	'&::after': {
  // 		content: '',
  // 		position: 'absolute',
  // 		left: '50%',
  // 		top: '50%',
  // 		transform: 'translate(-50%, -50%)',
  // 		width: 'min(60%, 28rem)',
  // 		height: '52px',
  // 		filter: 'blur(24px)',
  // 		background: `radial-gradient(
  //     45% 70% at 50% 50%,
  //     ${colorVars.white.alpha(0.22).css()},
  //     ${colorVars.white.alpha(0).css()} 65%
  //   )`,
  // 		pointerEvents: 'none',
  // 		zIndex: 0,
  // 		animation: `${mergePulse} 11s ease-in-out infinite`,
  // 		'@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
  // 	},
  // },
});

/**
 * Text lines — base gradient on the element (static), sheen on
 * ::after (animated). Uses only colorVars.white/black for
 * highlights/shadows. For the sheen to show, set the same text
 * content on a data attribute (data-text="...") so ::after can render
 * it.
 */
const shadow = projectorVars.textShadow;
export const line = style({
  display: 'inline-block',
  position: 'relative',
  zIndex: 1,

  color: colorVars.white.css(),
  WebkitTextFillColor: colorVars.white.css(),

  // use your black var for shadows (no rgba)
  // textShadow: [
  //   `0 1px 0 ${colorVars.black.alpha(0.12).css()}`,
  //   `0 6px 24px ${colorVars.black.alpha(0.1).css()}`,
  // ].join(', '),

  textShadow: `${shadow.offsetX.css()} ${shadow.offsetY.css()} ${shadow.blur.css()} ${shadow.color.css()}`,

  // selectors: {
  //   '&[data-position="first"]': {
  //     backgroundImage: `linear-gradient(to right, ${TITLE_LEFT.css()} 30%, ${TITLE_MERGE.css()} 60%)`,
  //   },
  //   '&[data-position="last"]': {
  //     marginTop: '-0.08em',
  //     backgroundImage: `linear-gradient(to right, ${TITLE_MERGE.css()} 20%, ${TITLE_RIGHT.css()} 80%)`,
  //   },
  //
  //   // sheen layer — matches the HTML ".line::after" approach
  //   '&::after': {
  //     content: 'attr(data-text)', // requires the same text on data-text
  //     position: 'absolute',
  //     inset: 0,
  //
  //     // mask the pseudo to the text as well
  //     color: 'transparent',
  //     WebkitTextFillColor: 'transparent',
  //     backgroundClip: 'text',
  //     WebkitBackgroundClip: 'text',
  //
  //     // moving highlight only (uses colorVars.white)
  //     backgroundImage: `linear-gradient(75deg,
  //       ${colorVars.white.alpha(0).css()} 42%,
  //       ${colorVars.white.alpha(0.85).css()} 50%,
  //       ${colorVars.white.alpha(0).css()} 58%
  //     )`,
  //     backgroundRepeat: 'no-repeat',
  //     backgroundSize: '200% 100%',
  //     backgroundPosition: '120% 50%',
  //
  //     mixBlendMode: 'screen',
  //     pointerEvents: 'none',
  //   },
  // },
});
