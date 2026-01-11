import { m, mPercent } from 'css-calipers';

import { defineFontVariant } from '../../src/styles/helpers/typography.helper';
import { fontFamilies } from './fontFamilies.test.tokens';

export const typographyFontVariants = {
  heading: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading',
    sourcePath:
      'tests/typography/typographyFontVariants.test.tokens.ts',
    config: {
      options: {
        textAlign: 'center',
        letterSpacing: m(0.08, 'em'),
        weightPercents: {
          default: mPercent(0),
        },
      },
    },
  }),
  h1: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h1',
    sourcePath:
      'tests/typography/typographyFontVariants.test.tokens.ts',
    config: {
      styleOverrides: {
        size: m(45),
      },
      options: {
        weightPercents: {
          default: mPercent(50),
        },
      },
    },
  }),
  h2: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h2',
    sourcePath:
      'tests/typography/typographyFontVariants.test.tokens.ts',
    config: {
      styleOverrides: {
        size: m(28),
      },
    },
  }),
} as const;
