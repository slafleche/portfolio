import { m, mPercent } from 'css-calipers';

import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/typography.helper';
import { fontFamilies } from '../fontFamilies.tokens';

const SOURCE_PATH = 'src/tokens/fontVariants/forms.ts';

export const formFontVariants = {
  base: defineFontVariant(fontFamilies.ibm, {
    label: 'form-base',
    sourcePath: SOURCE_PATH,
    config: {
      styleOverrides: {
        size: m(18),
        lineHeight: 1.1,
      },
      options: {
        weightPercents: {
          default: mPercent(40),
        },
      },
    },
  }),
  labels: defineFontVariant(fontFamilies.objectSans, {
    label: 'form-labels',
    sourcePath: SOURCE_PATH,
    config: {
      styleOverrides: {
        size: m(18),
      },
      options: {
        weightPercents: {
          default: mPercent(0),
        },
      },
    },
  }),
  input: defineFontVariant(fontFamilies.ibm, {
    label: 'form-input',
    sourcePath: SOURCE_PATH,
    config: {
      styleOverrides: {
        lineHeight: 1.5,
        size: m(18),
      },
      options: {
        weightPercents: {
          default: mPercent(0),
        },
      },
    },
  }),
  hints: defineFontVariant(fontFamilies.ibm, {
    label: 'form-hints',
    sourcePath: SOURCE_PATH,
    config: {
      styleOverrides: {
        size: m(16),
      },
      options: {
        weightPercents: {
          default: mPercent(50),
          strong: mPercent(90),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
