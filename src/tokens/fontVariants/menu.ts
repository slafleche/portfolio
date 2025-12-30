import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';

const SOURCE_PATH = 'src/tokens/fontVariants/menu.ts';

export const menuFontVariants = {
  menu: defineFontVariant(fontFamilies.ibm, {
    label: 'menu',
    sourcePath: SOURCE_PATH,
    waitForFonts: true,
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
