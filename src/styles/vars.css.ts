import chroma, { Color } from 'chroma-js';
import * as csstype from 'csstype';
import { measurement } from './helpers/measurement';

// These are separate so they can be manipulated individually if needed.
// If they are set in globalVars, they need to use .css()
export const colorVars = {
  // Main Colours
  brand: chroma('rgb(14,173,184)'),
  contrast: chroma('#8e233f'),
  // Nav
  navBg: chroma('#252136'),
  navFg: chroma('#fff'),
  // Body
  bodyBg: chroma('rgb(46,43,61)'),
  bodyFg: chroma('#fff'),
  // Text
  headingFg: chroma('#fff'),
  // Shadows
  shadow: chroma('rgb(3, 3, 3)').alpha(0.34),
  // Borders
  border: chroma('#1d1d1f'),

  // Contrast Section
  contrastBg: chroma('#252136'),
  contrastFg: chroma('#fff'),

  // Gradient A
  gradientA_main_start: chroma('#573f97'),
  gradientA_main_end: chroma('#9d4e9c'),

  gradientA_secondary_start: chroma('#f6debc'),
  gradientA_secondary_middle: chroma('#e6a87f'),
  gradientA_secondary_end: chroma('#ed79a8'),

  // Utility colours for mixing
  black: chroma('#000'),
  white: chroma('#FFF'),
  transparent: chroma('#ffffff').alpha(0),
};

export interface IBorder {
  color?: Color;
  width?: csstype.Property.BorderWidth;
  style?: 'none' | 'solid';
  radius?: csstype.Property.BorderRadius;
}

export const borderVars = {
  color: colorVars.border,
  style: 'solid',
  width: measurement('4px'),
  radius: measurement('6px'),
};

export const fontVars = {
  heading: {
    color: colorVars.headingFg.css(),
    family: 'Comfortaa, Poppins, Helvetica, Arial, sans-serif',
    size: '45px',
    weight: '500',
  },
  body: {
    family: 'Poppins, Helvetica, Arial, sans-serif',
    size: '22px',
    weight: '300',
    semiBold: '400',
    color: colorVars.bodyFg.css(),
  },
};
