import { m } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import { defineFontVariant, type FontVariantMap } from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/menu.ts';

export const menuVariants = {
  menu: defineFontVariant(fontFamilies.objectSans, {
    label: 'menu',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
    config: {
      overrides: {
        size: m(16),
      },
    },
  }),
} as const satisfies FontVariantMap;
