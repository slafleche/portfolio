import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';

const SOURCE_PATH = 'src/tokens/fontVariants/hero.ts';

export const heroFontVariants = {
  hero: defineFontVariant(fontFamilies.objectSans, {
    label: 'hero',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
    config: {
      overrides: {
        lineHeight: 1.3,
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
