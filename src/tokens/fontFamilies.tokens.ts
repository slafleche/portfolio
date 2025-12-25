import type { FontFamilyDef } from '../styles/helpers/types.helper';
import { m } from 'css-calipers';
import fontsConfig, {
  defineFontFamily,
} from '../styles/helpers/fontConfig.helper';
import fr from '../lib/locales/translations/fr';

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
  urbanist: defineFontFamily({
    familyName: 'Urbanist',
    fallbacks: [
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    cfgMap: fontsConfig,
    spacing: m(0, 'rem'),
    offsetToFlushTop: m(0, 'rem'),
    lineHeight: 1.2,
    weights: {
      default: 400,
      strong: 700,
    },
  }),
  fraktionMono: defineFontFamily({
    familyName: 'Fraktion Mono',
    fallbacks: [
      'IBM Plex Sans',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    cfgMap: fontsConfig,
    spacing: m(-0.05, 'em'),
    offsetToFlushTop: m(0, 'em'),
    lineHeight: 1.4,
    weights: {
      default: 400,
      strong: 700,
    },
  }),
  fraktionSans: defineFontFamily({
    familyName: 'Fraktion Sans',
    fallbacks: [
      'IBM Plex Sans',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    cfgMap: fontsConfig,
    spacing: m(-0.05, 'em'),
    offsetToFlushTop: m(0, 'em'),
    lineHeight: 1.4,
    weights: {
      default: 400,
      strong: 700,
    },
  }),
} satisfies Record<string, FontFamilyDef>;
