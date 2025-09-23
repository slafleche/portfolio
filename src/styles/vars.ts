import chroma, { type Color } from 'chroma-js';
import * as CSS from 'csstype';
import { IMeasurement, m } from './helpers/measurement';
export type ColorKeys = keyof typeof colors;
export type ChromaColor = Color;

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode or you
// could do math on a value.

// const backgroundColour = chroma('#453564');
const backgroundColour = chroma('#251e32');
// Target colour: #2c244b on #453564
const shadow = backgroundColour.darken(0.8).desaturate(0.2).alpha(0.5);

// <linearGradient id="c">
//   <stop offset=".17753" stopColor="#e6a87f" stopOpacity={1} />
//   <stop offset=".471" stopColor="#f27e8c" stopOpacity={1} />
//   <stop offset="1" stopColor="#ff549a" stopOpacity={1} />
// </linearGradient>
// <linearGradient id="b">
//   <stop offset=".0692" stopColor="#4744a0" stopOpacity={1} />
//   <stop offset=".36528" stopColor="#64eaeb" stopOpacity={1} />
// </linearGradient>
// <linearGradient id="a">
//   <stop offset=".20466" stopColor="#3e43a0" stopOpacity={1} />
//   <stop offset="1" stopColor="#fe5998" stopOpacity={1} />
// </linearGradient>

const gradients = {
  // a_start: chroma('#322b4d'),
  // a_mid: chroma('#6263b5'),
  // a_end: chroma('#5d4cb9'),

  a_liear_a: chroma('#322b4d'),
  a_liear_b: chroma('#6263b5'),
  a_liear_c: chroma('#5d4cb9'),

  a_spot_a: chroma('#99b7fd'),
  a_spot_b: chroma('#90faf7'),

  // Card B
  b_liear_a: chroma('#5b419a'),
  b_liear_b: chroma('#b98cde'),
  b_liear_c: chroma('#e1864e'),

  b_spot_a: chroma('#E15DAE'),
  b_spot_b: chroma('#F7D354'),
};

export const bokenVars = {
  // Default Bokeh overlay settings (consumed by components)
  colors: [
    gradients.b_liear_a,
    gradients.b_liear_b,
    gradients.b_liear_c,
    gradients.b_spot_a,
    gradients.a_liear_c,
  ],
  opacity: 0.2,
  blendMode: 'screen' as CSS.Property.MixBlendMode,
  blur: 50,
  blurScale: 1,
  sizeScale: 0.7,
  fadeMs: 300,
};
// export const bokehColours = {
//   a: a_liear_a,
//   b:
// };

export const gradientA = {
  overlayA: gradients.a_spot_a,
  overlayB: gradients.a_spot_b,
  linear: [gradients.a_liear_a, gradients.a_liear_b, gradients.a_liear_c],
};

// To update
export const gradientB = {
  overlayA: gradients.b_spot_a,
  overlayB: gradients.b_spot_b,
  linear: [gradients.b_liear_a, gradients.b_liear_b, gradients.b_liear_c],
};

// var gradientBlues = {

//   #5A2D92 0%,   /* deep violet */
//   #5A8CC7 45%,  /* blue */
//   #5ECCE5 75%,  /* cyan */
//   #63E3F0 90%,  /* aqua highlight */
//   #7C73A0 100%  /* muted violet tail */
// }

// background-image:
//   radial-gradient(chroma
//     circle at 100% 49%,
//     rgba(225,93,174,1.0) 0%,
//     rgba(225,93,174,0.85) 25%,
//     rgba(225,93,174,0.65) 40%,
//     rgba(225,93,174,0.35) 60%,
//     rgba(225,93,174,0.0) 80%
//   ),
//   radial-gradient(
//     circle at 97% 98%,
//     rgba(247,211,84,0.6) 0%,
//     rgba(247,211,84,0.0) 30%
//   ),
//   linear-gradient(
//     to bottom,
//     #5b419a 20%,
//     #b98cde 55%,
//     #e1864e 90%
//   );
// background-blend-mode: overlay, screen, normal;

// background-image:
//   radial-gradient(circle at 100% 49%, rgba(225,93,174,1.00) 0%, rgba(225,93,174,0.90) 18%, rgba(225,93,174,0.55) 30%, rgba(225,93,174,0.20) 42%, rgba(225,93,174,0.00) 62%),
//   radial-gradient(circle at 97% 98%, rgba(247,211,84,0.63) 0%, rgba(247,211,84,0.00) 26%),
//   linear-gradient(to bottom, #5b419a 19%, #b98cde 55%, #e1864e 93%);
// background-blend-mode: overlay, screen, normal;

// Meant to easily overwrite the defaults with theming
// Note the goal isn't for the new theme to use exactly the same calculations
// for the shadows or anything else, the goal is to write a custom .ts file
// with the new themes's rules.

export const defaults = {
  backgroundColour,
  shadow,
  gradients,
  fg: chroma('#ffffff'),
  bg: chroma('#000000'),
};

export const colors = {
  // Main Colours
  brand: chroma('#573f97'),
  contrast: chroma('rgba(10, 133, 142, 1)'),
  // Nav
  // navBg: chroma('#252136'),
  navFg: defaults.fg,
  // Body
  bodyBg: defaults.backgroundColour,

  bodyFg: defaults.fg,
  // Text
  headingFg: defaults.fg,
  // Shadows
  shadow,
  // Borders
  border: chroma('#1d1d1f'),

  // Gradient A
  gradientA_main_start: chroma('#573f97'),
  gradientA_main_end: chroma('#9d4e9c'),

  gradientA_secondary_start: chroma('#f6debc'),
  gradientA_secondary_middle: chroma('#e6a87f'),
  gradientA_secondary_end: chroma('#ed79a8'),

  // Utility colours for mixing
  black: chroma('#000000'),
  white: chroma('#ffffff'),
  transparent: chroma('#ffffff').alpha(0),
} as const;

export const font = {
  heading: {
    family: 'Comfortaa, Poppins, Helvetica, Arial, sans-serif',
  },
  h1: {
    size: m(45),
    weight: '500',
  },
  h2: {
    size: m(25),
    weight: '500',
  },
  h3: {
    size: m(20),
    weight: '500',
  },
  body: {
    family: 'Poppins, Helvetica, Arial, sans-serif',
    size: m(22),
    weight: '300',
    semiBold: '400',
  },
} as const;

export const colorVars = {
  // Main Colours
  brand: colors.brand,
  contrast: colors.contrast,
  // Nav
  navFg: colors.navFg,
  // Body
  bodyBg: colors.bodyBg,
  bodyFg: colors.bodyFg,
  // Text
  headingFg: colors.headingFg,
  // Shadows
  shadow: colors.shadow,
  // Borders
  border: colors.border,

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

export interface IBorder {
  color?: CSS.Property.BorderColor;
  width?: IMeasurement;
  style?: 'none' | 'solid';
  radius?: IMeasurement;
}

export const borderVars = {
  color: colorVars.border,
  style: 'solid' as string,
  width: m(4),
  radius: m(6),
};

export const fontVars = {
  menu: {
    size: m(15),
  },
  heading: {
    color: colorVars.headingFg,
    family: font.heading.family,
  },
  h1: {
    ...font.h1,
  },
  h2: {
    ...font.h2,
  },
  h3: {
    ...font.h3,
  },
  body: {
    family: font.body.family,
    size: font.body.size,
    weight: font.body.weight,
    semiBold: font.body.semiBold,
    color: colorVars.bodyFg,
  },
};

export const archVars = {
  top: 40,
  curveHeight: 16,
  ry: 70,
  bumpHeight: 12,
  bumpWidth: 60,
  bumpBaseWidth: 0.9,
  bumpTipWidth: 9,
};

export const logoVars = {
  width: m(40),
  offsetY: m(4),
  offsetX: m(-1),
  shadowRatio: 948.31276 / 546.93464, // from shadow width (in the SVG) / logo width
};

export const dropShadowVars = {
  offsetX: m(12),
  offsetY: m(12),
  blur: m(3),
  color: colorVars.shadow,
};
