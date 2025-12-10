import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import { defineFontVariant, type FontVariantMap } from './core';

const SOURCE_PATH = 'src/tokens/fontVariants/headings.ts';

export const headingVariants = {
  heading: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading',
    sourcePath: SOURCE_PATH,
  }),
  h1: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading-h1',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(45),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
  h2: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading-h2',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(26),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
  h3: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading-h3',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(23),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
  h4: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading-h4',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(20),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
  h5: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading-h5',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(18),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
  h6: defineFontVariant(fontFamilies.urbanist, {
    label: 'heading-h6',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(17),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
} as const satisfies FontVariantMap;
