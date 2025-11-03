import type { FontFamilyDef } from '../styles/helpers/types';
import { m } from '../styles/helpers/measurement';
import fontsConfig, {
  makeFamilyDef,
} from '../styles/helpers/fontConfig';

export const fontFamilies = {
  system: makeFamilyDef({
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
  }),
  ibm: makeFamilyDef({
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
  }),
  urbanist: makeFamilyDef({
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
  }),
} satisfies Record<string, FontFamilyDef>;
