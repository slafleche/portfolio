import { fontFamilies } from './fontFamilies.tokens';
import type { FontStyles } from '../styles/helpers/types';
import { fontWeight } from '../styles/helpers/typography.helpers';
import { m } from '../styles/helpers/measurement';

const defaultHeadingFont = fontFamilies.urbanist;
const defaultBodyFont = fontFamilies.ibm;

export const fontVars = {
  menu: {
    size: m(16),
    ...fontFamilies.urbanist,
    waitForFonts: [
      'Urbanist',
    ],
  },
  hero: {
    ...defaultHeadingFont,
    fontWeight: fontWeight(defaultHeadingFont, 20),
    lineHeight: 1.1,
    size: m(45),
    waitForFonts: [
      'Outfit',
    ],
  },
  heading: {
    ...defaultHeadingFont,
  },
  h1: {
    ...defaultHeadingFont,
    size: m(45),
    fontWeight: fontWeight(defaultHeadingFont, 100),
  },
  h2: {
    ...defaultHeadingFont,
    size: m(26),
    fontWeight: fontWeight(defaultHeadingFont, 100),
  },
  h3: {
    ...defaultHeadingFont,
    size: m(23),
    fontWeight: fontWeight(defaultHeadingFont, 100),
  },
  h4: {
    ...defaultHeadingFont,
    size: m(20),
    fontWeight: fontWeight(defaultHeadingFont, 100),
  },
  h5: {
    ...defaultHeadingFont,
    size: m(18),
    fontWeight: fontWeight(defaultHeadingFont, 100),
  },
  h6: {
    ...defaultHeadingFont,
    size: m(17),
    fontWeight: fontWeight(defaultHeadingFont, 100),
  },
  body: {
    size: m(16),
    lineHeight: 1,
    ...defaultBodyFont,
    fontWeight: fontWeight(defaultBodyFont, 0),
    weights: {
      default: fontWeight(defaultBodyFont, 0),
      strong: defaultBodyFont.weights.strong,
    },
  },
} satisfies Record<string, FontStyles>;
