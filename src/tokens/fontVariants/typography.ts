import { m, mPercent } from 'css-calipers';
import { fontFamilies } from '../fontFamilies.tokens';
import {
  defineFontVariant,
  type FontVariantMap,
} from '../../styles/helpers/fontVariant.helper';

const SOURCE_PATH = 'src/tokens/fontVariants/typography.ts';
export const typographyFontVariants = {
  body: defineFontVariant(fontFamilies.ibm, {
    label: 'body',
    sourcePath: SOURCE_PATH,
    config: {
      overrides: {
        size: m(20),
        lineHeight: 1.5,
      },
      options: {
        weightPercents: {
          default: mPercent(50),
          strong: mPercent(100),
        },
      },
    },
  }),
  heading: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading',
    sourcePath: SOURCE_PATH,
    config: {
      options: {
        textAlign: 'center',
        textTransform: 'uppercase',
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
  }),
  h1: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h1',
    config: {
      overrides: {
        size: m(45),
      },
    },
  }),
  h2: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h2',

    config: {
      overrides: {
        size: m(26),
      },
    },
  }),
  h3: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h3',
    config: {
      overrides: {
        size: m(23),
      },
    },
  }),
  h4: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h4',

    config: {
      overrides: {
        size: m(20),
      },
    },
  }),
  h5: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h5',

    config: {
      overrides: {
        size: m(18),
      },
    },
  }),
  h6: defineFontVariant(fontFamilies.objectSans, {
    label: 'heading-h6',

    config: {
      overrides: {
        size: m(17),
      },
    },
  }),
} as const satisfies FontVariantMap;
