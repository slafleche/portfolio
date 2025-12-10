import { m } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import { defineFontVariant, type FontVariantMap } from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/menu.ts';

export const menuVariants = {
  menu: defineFontVariant(fontFamilies.urbanist, {
    label: 'menu',
    sourcePath: SOURCE_PATH,
    waitForFonts: [
      'Urbanist',
    ],
    config: {
      overrides: {
        size: m(16),
      },
    },
  }),
} as const satisfies FontVariantMap;
