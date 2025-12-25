import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import { defineFontVariant, type FontVariantMap } from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/hero.ts';

export const heroVariants = {
  hero: defineFontVariant(fontFamilies.objectSans, {
    label: 'hero',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
    config: {
      overrides: {
        size: m(26),
      },
      options: {
        weightPercents: {
          default: mPercent(50),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
