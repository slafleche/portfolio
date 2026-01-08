import { m, mPercent } from 'css-calipers';

import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';
import { fontFamilies } from '../fontFamilies.tokens';

const SOURCE_PATH = 'src/tokens/fontVariants/hero.ts';

export const heroFontVariants = {
  hero: defineFontVariant(fontFamilies.objectSans, {
    label: 'hero',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
    config: {
      styleOverrides: {
        lineHeight: 1.1,
        offsetBottom: m(0),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
