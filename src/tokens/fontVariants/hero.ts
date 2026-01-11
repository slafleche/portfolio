import { m, mPercent } from 'css-calipers';

import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/typography.helper';
import { fontFamilies } from '../fontFamilies.tokens';

const SOURCE_PATH = 'src/tokens/fontVariants/hero.ts';

export const heroFontVariants = {
  hero: defineFontVariant(fontFamilies.objectSans, {
    label: 'hero',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
    config: {
      styleOverrides: {
        size: m(64),
        lineHeight: 1.2,
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
