import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';
import { baseTypographyVariants } from './typography';

const SOURCE_PATH = 'src/tokens/fontVariants/forms.ts';

export const formFontVariants = {
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
