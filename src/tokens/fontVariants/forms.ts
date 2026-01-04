import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';

const SOURCE_PATH = 'src/tokens/fontVariants/forms.ts';

export const formFontVariants = {
  base: defineFontVariant(fontFamilies.ibm, {
    label: 'form-base',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
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
      overrides: {
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
      overrides: {
        lineHeight: 1.1,
        size: m(16),
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
      overrides: {
        size: m(16),
      },
      options: {
        weightPercents: {
          default: mPercent(0),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
