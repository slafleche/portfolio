import type { FontFamilyDef } from '../styles/helpers/types.helper';
import { m } from 'css-calipers';
import fontsConfig, {
  defineFontFamily,
} from '../styles/helpers/fontConfig.helper';

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
    spacing: m(0.5, 'rem'),
    offsetToFlushTop: m(-0.3, 'rem'),
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
    spacing: m(0, 'rem'),
    offsetToFlushTop: m(0, 'rem'),
    lineHeight: 1.6,
    weights: {
      default: 400,
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
    spacing: m(0, 'em'),
    offsetToFlushTop: m(0, 'em'),
    lineHeight: 1,
    weights: {
      default: 400,
      strong: 600,
    },
  }),
  code: defineFontFamily({
    familyName: 'code',
    fallbacks: [
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    cfgMap: fontsConfig,
    spacing: m(0, 'em'),
    offsetToFlushTop: m(0, 'em'),
    lineHeight: 1.45,
    weights: {
      default: 400,
      strong: 600,
    },
  }),
} satisfies Record<string, FontFamilyDef>;
