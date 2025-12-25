import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import { defineFontVariant, type FontVariantMap } from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/hero.ts';

export const heroVariants = {
  hero: defineFontVariant(fontFamilies.fraktionMono, {
    label: 'hero',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
    config: {
      overrides: {
        size: m(45),
        lineHeight: 1.1,
      },
      options: {
        weightPercents: {
          default: mPercent(0),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
