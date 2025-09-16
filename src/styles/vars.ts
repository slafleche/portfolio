import chroma, { type Color } from 'chroma-js';
import * as CSS from 'csstype';
import { IMeasurement, measurement } from './helpers/measurement';
export type ColorKeys = keyof typeof colors;
export type ChromaColor = Color;

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode
export const colors = {
  // Main Colours
  brand: chroma('rgb(14,173,184)'),
  contrast: chroma('rgba(10, 133, 142, 1)'),
  // Nav
  navBg: chroma('#252136'),
  navFg: chroma('#ffffff'),
  // Body
  bodyBg: chroma('rgb(46,43,61)'),
  bodyFg: chroma('#ffffff'),
  // Text
  headingFg: chroma('#ffffff'),
  // Shadows
  shadow: chroma('rgb(3, 3, 3)').alpha(0.6),
  // Borders
  border: chroma('#1d1d1f'),

  // Contrast Section
  contrastBg: chroma('#252136'),
  contrastFg: chroma('#ffffff'),

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
    size: measurement(45),
    weight: '500',
  },
  h2: {
    size: measurement(25),
    weight: '500',
  },
  h3: {
    size: measurement(20),
    weight: '500',
  },
  body: {
    family: 'Poppins, Helvetica, Arial, sans-serif',
    size: measurement(22),
    weight: '300',
    semiBold: '400',
  },
} as const;

export const colorVars = {
  // Main Colours
  brand: colors.brand,
  contrast: colors.contrast,
  // Nav
  navBg: colors.navBg,
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
  contrastBg: colors.contrastBg,
  contrastFg: colors.contrastFg,

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
  style: 'solid' as const,
  width: measurement(4),
  radius: measurement(6),
};

export const fontVars = {
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
  bumpWidth: 50,
  bumpBaseWidth: 0.85,
  bumpTipWidth: 7,
};

export const logoVars = {
  width: measurement(45),
};
