import { m, mRem } from 'css-calipers';

import fontsConfig, {
  defineFontFamily,
} from '../styles/helpers/fontConfig.helper';
import type { FontFamilyDef } from '../styles/helpers/types.helper';

export const fontFamilies = {
  system: defineFontFamily({
    fallbacks: [
      'Segoe UI',
      'SF Pro Text',
      'Helvetica Neue',
      'Avenir Next',
      'Tahoma',
      'Verdana',
      'Helvetica',
      'Arial',
      'sans-serif',
    ],
    cfgMap: fontsConfig,
    letterSpacing: m(0.5, 'rem'),
    offsetToFlushTop: m(0, 'rem'),
    lineHeight: 1.4,
    weights: {
      low: 400,
      default: 400,
      strong: 700,
      high: 700,
    },
  }),
  ibm: defineFontFamily({
    familyName: 'IBM Plex Sans',
    fallbacks: [
      'Arial Rounded MT Bold',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    cfgMap: fontsConfig,
    letterSpacing: mRem(0.03),
    offsetToFlushTop: mRem(-0.38),
    lineHeight: 1.6,
    weights: {
      default: 300,
      strong: 600,
    },
  }),
  objectSans: defineFontFamily({
    familyName: 'Object Sans',
    fallbacks: [
      'IBM Plex Sans',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    cfgMap: fontsConfig,
    letterSpacing: mRem(0.03),
    offsetToFlushTop: mRem(-0.44),
    offsetBottom: mRem(0),
    lineHeight: 1.5,
    weights: {
      default: 400,
      strong: 600,
    },
  }),
  code: defineFontFamily({
    familyName: 'System+Code+Fonts',
    fallbacks: [
      'Menlo',
      'Consolas',
      'Segoe UI',
      'Monaco',
      'SFMono-Regular',
      '-apple-system',
      'BlinkMacSystemFont',
      'Noto Sans',
      'ui-monospace',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    cfgMap: fontsConfig,
    letterSpacing: m(0, 'em'),
    offsetToFlushTop: m(0, 'em'),
    lineHeight: 1.3,
    weights: {
      default: 400,
      strong: 600,
    },
  }),
} satisfies Record<string, FontFamilyDef>;
