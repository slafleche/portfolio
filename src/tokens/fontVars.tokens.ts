import { fontFamilies } from './fontFamilies.tokens';
import type { FontStyles } from '../styles/helpers/types';
import { relativeFontWeight } from '../styles/helpers/typography.helpers';
import { m, mPercent } from '../styles/measurementKit';

const headingFamily = fontFamilies.urbanist;
const bodyFamily = fontFamilies.ibm;

const defineFontVariant = (
  family: typeof headingFamily,
  overrides: FontStyles = {},
): FontStyles => {
  const base: FontStyles = {
    familyDef: family,
    spacing: family.spacing,
    offsetToFlushTop: family.offsetToFlushTop,
    lineHeight: family.lineHeight,
    weights: overrides.weights ?? {
      default: family.weights.default,
      strong: family.weights.strong,
    },
    css: family.css ? { ...family.css } : undefined,
  };

  return {
    ...base,
    ...overrides,
    css: {
      ...(base.css ?? {}),
      ...(overrides.css ?? {}),
    },
  };
};

export const fontVars = {
  menu: defineFontVariant(headingFamily, {
    size: m(16),
    waitForFonts: [
      'Urbanist',
    ],
  }),
  hero: defineFontVariant(headingFamily, {
    fontWeight: relativeFontWeight(headingFamily, mPercent(20)),
    lineHeight: 1.1,
    size: m(45),
    waitForFonts: [
      'Outfit',
    ],
  }),
  heading: defineFontVariant(headingFamily),
  h1: defineFontVariant(headingFamily, {
    size: m(45),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  }),
  h2: defineFontVariant(headingFamily, {
    size: m(26),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  }),
  h3: defineFontVariant(headingFamily, {
    size: m(23),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  }),
  h4: defineFontVariant(headingFamily, {
    size: m(20),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  }),
  h5: defineFontVariant(headingFamily, {
    size: m(18),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  }),
  h6: defineFontVariant(headingFamily, {
    size: m(17),
    fontWeight: relativeFontWeight(headingFamily, mPercent(100)),
  }),
  body: defineFontVariant(bodyFamily, {
    size: m(16),
    lineHeight: 1,
    fontWeight: relativeFontWeight(bodyFamily, mPercent(0)),
    weights: {
      default: relativeFontWeight(bodyFamily, mPercent(0)),
      strong: bodyFamily.weights.strong,
    },
  }),
} satisfies Record<string, FontStyles>;
