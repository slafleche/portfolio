import { m, mPercent } from 'css-calipers';

import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/typography.helper';
import { fontFamilies } from '../fontFamilies.tokens';

const SOURCE_PATH = 'src/tokens/fontVariants/footer.ts';

export const footerFontVariants = {
  cta: defineFontVariant(fontFamilies.ibm, {
    label: 'footer-cta',
    sourcePath: SOURCE_PATH,
    config: {
      styleOverrides: {
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
