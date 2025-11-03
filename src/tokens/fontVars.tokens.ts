import { fontFamilies } from './fontFamilies.tokens';
import type { FontStyles } from '../styles/helpers/types';
import { relativeFontWeight } from '../styles/helpers/typography.helpers';
import { m, mPercent } from '../styles/measurementKit';

const headingFamily = fontFamilies.urbanist;
const bodyFamily = fontFamilies.ibm;

export const fontVars = {
  menu: {
    familyDef: headingFamily,
    size: m(16),
    waitForFonts: [
      'Urbanist',
    ],
  },
  hero: {
    familyDef: headingFamily,
    fontWeight: relativeFontWeight(headingFamily, mPercent(20)),
    lineHeight: 1.1,
    size: m(45),
    waitForFonts: [
      'Outfit',
    ],
  },
  heading: {
    familyDef: headingFamily,
  },
  h1: {
    familyDef: headingFamily,
    size: m(45),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  },
  h2: {
    familyDef: headingFamily,
    size: m(26),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  },
  h3: {
    familyDef: headingFamily,
    size: m(23),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  },
  h4: {
    familyDef: headingFamily,
    size: m(20),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  },
  h5: {
    familyDef: headingFamily,
    size: m(18),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  },
  h6: {
    familyDef: headingFamily,
    size: m(17),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  },
  body: {
    familyDef: bodyFamily,
    size: m(16),
    lineHeight: 1,
    fontWeight: relativeFontWeight(bodyFamily, mPercent(0)),
    weights: {
      default: relativeFontWeight(bodyFamily, mPercent(0)),
      strong: bodyFamily.weights.strong,
    },
  },
} satisfies Record<string, FontStyles>;
