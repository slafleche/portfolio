import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import { defineFontVariant, type FontVariantMap } from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/body.ts';

export const bodyVariants = {
  body: defineFontVariant(fontFamilies.ibm, {
    label: 'body',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(16),
      },
      options: {
        weightPercents: {
          default: mPercent(0),
          strong: mPercent(100),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
