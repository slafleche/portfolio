import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/hero.ts';

export const heroVariants = {
  hero: defineFontVariant(fontFamilies.urbanist, {
    label: 'hero',
    sourcePath: SOURCE_PATH,
    waitForFonts: ['Outfit'],
    config: {
      overrides: {
        size: m(45),
        lineHeight: 1.1,
      },
      options: {
        weightPercents: {
          default: mPercent(20),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
