import { m, mPercent } from 'css-calipers';

import { color } from '../styles/helpers/colorWrap.helper';
import type { LinearOpts } from '../styles/helpers/gradients.helper';
export type ColorKeys = keyof typeof colors;

export type {
  BorderMeasurementInput,
  BorderRadiusConfig,
  BorderRadiusInput,
  BorderWidthConfig,
  BorderWidthInput,
  IBorder,
} from '../styles/helpers/types.helper';

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode or you
// could do math on a value.

const backgroundColour = color('#020014');
// Target colour: #2c244b on #453564
const shadow = backgroundColour
  .darken(0.8)
  .desaturate(0.2)
  .alpha(0.5);
const darkPurple = color('hsl(260 40% 10%)');
const lightPurple = color('hsl(278 51% 15%)');
const midPurple = darkPurple.mix(lightPurple, 0.5);
const wine = color('hsl(310 40% 12%)'); // a bit more red

const brand = color('#0D9488');
const secondary = color('#0868b2');
const brandMix = brand.mix(secondary, 0.5);
const reddish = color('hsl(295 85% 24%)');
const electricBlue = color('#3dcbff');

const shapeGradientA = {
  a: color('hsl(257 87% 21%)'),
  b: color('hsl(310 56% 21%)'),
  c: color('hsl(295 85% 24%)'),
};

const shapeGradientB = {
  a: color('hsla(257, 87%, 21%, 1.00)'),
  b: color('hsla(284, 72%, 32%, 1.00)'),
  c: color('hsl(260 64% 31%)'),
};

// System - Triangle A
const triangleA_blend = 0.7;
const triangleA_alpha = 0.4;

const triangleA_color_a = color('hsl(270, 50%, 36%)')
  .mix(reddish, triangleA_blend)
  .alpha(triangleA_alpha);
const triangleA_color_b = color('hsl(280, 45%, 34%)')
  .mix(reddish, triangleA_blend)
  .alpha(triangleA_alpha);
const triangleA_color_c = color('hsl(265, 48%, 38%)')
  .mix(reddish, triangleA_blend)
  .alpha(triangleA_alpha);
const triangleA_color_d = color('hsl(275, 46%, 28%)').mix(
  reddish,
  triangleA_blend,
);
// System - Triangle B
const triangleB_blend = 0.9;
const triangleB_alpha = 0.4;
const bMixer = color('#ff8000');
const triangleB_color_a = color('hsl(255, 50%, 36%)')
  .mix(bMixer, triangleB_blend)
  .alpha(triangleB_alpha);
const triangleB_color_b = color('hsl(265, 45%, 34%)')
  .mix(bMixer, triangleB_blend)
  .alpha(triangleB_alpha);
const triangleB_color_c = color('hsl(250, 48%, 38%)')
  .mix(bMixer, triangleB_blend)
  .alpha(triangleB_alpha);
const triangleB_color_d = color('hsl(260, 46%, 28%)')
  .mix(bMixer, triangleB_blend)
  .alpha(triangleB_alpha);

// System - Triangle C
const triangleC_alpha = 1;

const triangleC_color_a = electricBlue.alpha(triangleC_alpha);
const triangleC_color_b = electricBlue.alpha(triangleC_alpha);
const triangleC_color_c = electricBlue.alpha(triangleC_alpha);
const triangleC_color_d = electricBlue.alpha(triangleC_alpha);

export const themeColours = {
  brand,
  secondary,
  brandMix,
  electricBlue,

  lights: {
    a: electricBlue, // Electric blue
    b: color('#CCFF00'), // Electric lime
    c: color('#FF6B6B'), // Coral
    d: color('#FFB800'), // Amber
    e: color('#00FFB3'), // Mint
  },
  roundedTriangle: {
    a: shapeGradientA.a,
    b: shapeGradientA.b,
    c: shapeGradientA.c,
  },
  nubbyTriangle: {
    a: shapeGradientB.a,
    b: shapeGradientB.b,
    c: shapeGradientB.c,
  },
  purples: {
    dark: darkPurple,
    mid: midPurple,
    light: lightPurple,
    reddish,
    wine,
  },
  systems: {
    gradientA: {
      a: triangleA_color_a,
      b: triangleA_color_b,
      d: triangleA_color_c,
      c: triangleA_color_d,
    },
    gradientB: {
      a: triangleB_color_a,
      b: triangleB_color_b,
      c: triangleB_color_c,
      d: triangleB_color_d,
    },
    gradientC: {
      a: triangleC_color_a,
      b: triangleC_color_b,
      c: triangleC_color_c,
      d: triangleC_color_d,
    },
  },
  gradients: {
    main: {
      start: darkPurple,
      middle: wine.mix(midPurple, 0.5),
      end: lightPurple,
    },
    ctaConfig: {
      angle: m(45, 'deg'),
      stops: [
        { color: brand, at: mPercent(0) },
        { color: secondary, at: mPercent(100) },
      ],
    } as LinearOpts,
  },
};

// export const gradientFull = {
// 	overlayA: gradients.b_spot_a,
// 	overlayB: gradients.b_spot_b,
// 	linear: [
// 		gradients.b_linear_a,
// 		gradients.b_linear_b,
// 		gradients.b_linear_c,
// 	] as [ColorWrapper, ColorWrapper, ColorWrapper],
// };

// export const gradientA = {
// 	overlayA: gradients.gradients,
// 	overlayB: gradients.base_b,
// 	linear: as[(ColorWrapper, ColorWrapper)],
// };

// export const gradientB = {
// 	overlayA: gradients.b_spot_a,
// 	overlayB: gradients.b_spot_b,
// 	linear: [
// 		gradients.b_linear_a,
// 		gradients.b_linear_b,
// 		gradients.b_linear_c,
// 	] as [ColorWrapper, ColorWrapper, ColorWrapper],
// };

// var gradientBlues = {

//   #5A2D92 0%,   /* deep violet */
//   #5A8CC7 45%,  /* blue */
//   #5ECCE5 75%,  /* cyan */
//   #63E3F0 90%,  /* aqua highlight */
//   #7C73A0 100%  /* muted violet tail */
// }

// Meant to easily overwrite the defaults with theming
// Note the goal isn't for the new theme to use exactly the same calculations
// for the shadows or anything else, the goal is to write a custom .ts file
// with the new themes's rules.

const baseColours = {
  backgroundColour,
  shadow,
  fg: color('#ffffff'),
  bg: color('#000000'),
};

export const colors = {
  // Main Colours
  brand: color('#5b4199'),
  contrast: color('#88dbfc'),
  successAccent: color('#34d399'),
  // Nav
  // navBg: color('#252136'),
  navFg: baseColours.fg,
  // Body
  bodyBg: baseColours.backgroundColour,

  bodyFg: baseColours.fg,
  // Text
  headingFg: baseColours.fg,
  // Shadows
  shadow,
  // Borders
  border: color('#1d1d1f'),

  // Gradient A
  gradientA_main_start: color('#573f97'),
  gradientA_main_end: color('#9d4e9c'),

  gradientA_secondary_start: color('#f6debc'),
  gradientA_secondary_middle: color('#e6a87f'),
  gradientA_secondary_end: color('#ed79a8'),

  // Utility colours for mixing
  black: color('#000000'),
  white: color('#ffffff'),
  transparent: color('#ffffff').alpha(0),
} as const;

export const colorVars = {
  // Main Colours
  brand: colors.brand,
  contrast: colors.contrast,
  successAccent: colors.successAccent,
  // Nav
  navFg: colors.navFg,
  navBg: colors.shadow,
  // Body
  bodyBg: colors.bodyBg,
  bodyFg: colors.bodyFg,

  // Text
  headingFg: colors.headingFg,

  // Shadows
  shadow: colors.shadow,

  // Borders
  border: colors.border,

  // SVGs
  // svgColor: colors.white,
  // svgBg: themeColours.brand.lighten(0.3),

  // Contrast Section
  // contrastBg: colors.contrastBg,

  // Gradient A
  gradientA_main_start: colors.gradientA_main_start,
  gradientA_main_end: colors.gradientA_main_end,

  gradientA_secondary_start: colors.gradientA_secondary_start,
  gradientA_secondary_middle: colors.gradientA_secondary_middle,
  gradientA_secondary_end: colors.gradientA_secondary_end,

  // Utility colours for mixing
  black: colors.black,
  white: colors.white,
  transparent: colors.transparent,
};

// Intentionally don't export font delarations, use font instead.
export const borderVars = {
  color: colorVars.border,
  style: 'solid' as string,
  width: m(4),
  radius: m(16),
};

// export const archVars: ArchVars = {
//   top: m(55),
//   curveHeight: m(15),
//   ry: m(70),
//   bumpHeight: m(13),
//   bumpWidth: m(80),
//   bumpBaseWidth: 1,
//   bumpTipWidth: m(10),
// };

// background: currentColor;
// border-radius: 50%;
// transform: scale(0.7);
// position: fixed;
// top: 12px;
// left: 12px;
// z-index: 1000;
// border: solid #fff 1px;

export const dropShadowVars = {
  offsetY: m(2),
  offsetX: m(2),
  blur: m(2),
  alpha: 1,
  color: colorVars.shadow,
};

export const glowVars = {
  mix: {
    base: 0.45,
    fill: 0.7,
    sustain: 0.55,
  },
  blur: {
    primary: 14,
    secondary: 32,
  },
};

const baseColor = colorVars.white.mix(colorVars.bodyBg, 0.5);

export const chevronVars = {
  width: m(40),
  padding: m(20),
  height: 'auto',
  display: 'block',
  fill: baseColor,
  gradientStart: baseColor,
  gradientMid: baseColor,
  gradientMidOffset: 0.7,
  gradientEnd: colorVars.black.mix(baseColor, 0.5),
  highlight: baseColor,
  container: {
    height: m(120),
  },
};

export const spacingVars = {
  scrollPaddingOffset: m(20),
};

export const consoleVars = {
  borders: {
    radius: m(10),
  },
};
