import chroma, { Color } from 'chroma-js';
import * as csstype from 'csstype';
import { measurement } from './helpers/measurement';

// These are separate so they can be manipulated individually if needed.
// If they are set in globalVars, they need to use .css()
export const colorVars = {
  brand: chroma('rgb(14,173,184)'),
  bodyBg: chroma('rgb(46,43,61)'),
  bodyFg: chroma('#fff'),
  headingFg: chroma('#484a4d'),
  contrast: chroma('#8e233f'),
  black: chroma('#000'),
  white: chroma('#FFF'),
  transparent: chroma('#ffffff').alpha(0),
  shadow: chroma('rgb(3, 3, 3)').alpha(0.34),
  border: chroma('#1d1d1f'),
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
