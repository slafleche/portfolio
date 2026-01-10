import { m, mEm, mPercent, mRem } from 'css-calipers';

import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';
import { fontFamilies } from '../fontFamilies.tokens';

const SOURCE_PATH = 'src/tokens/fontVariants/typography.ts';
export const typographyFontVariants = {
  body: defineFontVariant(fontFamilies.ibm, {
    label: 'body',
    sourcePath: SOURCE_PATH,
    config: {
      styleOverrides: {
        size: m(18),
        lineHeight: 1.5,
      },
      options: {
        weightPercents: {
          default: mPercent(30),
          strong: mPercent(100),
        },
      },
    },
  }),
  heading: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading',
    sourcePath: SOURCE_PATH,
    config: {
      options: {
        textAlign: 'left',
        letterSpacing: mEm(0.04),
        offsetBottom: mRem(0.1),
        weightPercents: {
          default: mPercent(0),
        },
      },
    },
  }),
  h1: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h1',
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
    config: {
      options: {
        offsetBottom: mEm(0.8),
        textAlign: 'center',
      },
      styleOverrides: {
        size: m(28),
      },
    },
  }),
  h3: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h3',
    config: {
      styleOverrides: {
        size: m(23),
      },
    },
  }),
  h4: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h4',

    config: {
      styleOverrides: {
        size: m(20),
      },
    },
  }),
  h5: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h5',

    config: {
      styleOverrides: {
        size: m(18),
      },
    },
  }),
  h6: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h6',

    config: {
      styleOverrides: {
        size: m(17),
      },
    },
  }),
} as const satisfies FontVariantMap;
