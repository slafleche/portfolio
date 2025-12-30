import { colorVars } from '@/tokens/global.tokens';
import { m } from 'css-calipers';


// import { relativeFontWeight } from '../styles/helpers/typography.helper';
// import { fontFamilies } from './fontFamilies.tokens';

export const formTokens = {
  textarea: {
    minHeight: m(250),
  },
  label: {
    text: {
      color: colorVars.white.alpha(0.85),
      fontSize: m(16),

      // ...fontFamilies.objectSans.
      // fontWeight: relativeFontWeight()
    },
  },
  layout: {
    maxWidth: m(640),
    fieldGap: m(12),
    sectionGap: m(16),
  },
  field: {
    text: {
      color: colorVars.white.alpha(0.92),
    },
    placeholder: {
      color: colorVars.white.alpha(0.55),
    },
    paddings: {
      vertical: m(12),
      horizontal: m(0),
    },
    borders: {
      top: {
        width: m(1),
        color: colorVars.transparent,
      },
      horizontal: {
        width: m(1),
        color: colorVars.transparent,
      },
      bottom: {
        width: m(1),
        color: colorVars.white.alpha(0.18),
      },
    },
    hover: {
      borders: {
        color: colorVars.white.alpha(0.32),
      },
    },
    focusVisible: {
      shadow: [
        {
          // blur: m(4),
          // color: colorVars.brand.alpha(0.45),
        },
      ],
      borders: {
        color: colorVars.brand.alpha(0.65),
      },
      outlines: {
        width: m(3),
        color: colorVars.brand.alpha(0.65),
      },
    },
    error: {
      text: {
        color: colorVars.gradientA_secondary_end,
      },
      borders: {
        color: colorVars.gradientA_secondary_end.alpha(0.8),
      },
    },
    backgrounds: {
      color: colorVars.transparent,
    },
  },
  status: {
    success: {
      backgrounds: {
        color: colorVars.brand.alpha(0.16),
      },
      borders: {
        color: colorVars.brand.alpha(0.45),
      },
    },
    error: {
      backgrounds: {
        color: colorVars.gradientA_secondary_middle.alpha(0.18),
      },
      borders: {
        color: colorVars.gradientA_secondary_end.alpha(0.55),
      },
    },
    generic: {
      backgrounds: {
        // color: colorVars.shadow.alpha(0.3),
      },
      borders: {
        color: colorVars.gradientA_secondary_end.alpha(0.35),
      },
    },
  },
  button: {
    minHeight: m(48),
    paddings: {
      horizontal: m(24),
    },
    borders: {
      radius: m(28),
    },
  },
  privacy: {
    text: {
      color: colorVars.white.alpha(0.7),
    },
  },
  counter: {
    text: {
      color: colorVars.white.alpha(0.65),
    },
  },
  successPanel: {
    icon: {
      color: colorVars.successAccent.alpha(0.9),
      background: colorVars.successAccent.alpha(0.12),
    },
    body: {
      color: colorVars.white.alpha(0.82),
    },
  },
} as const;

export type FormTokens = typeof formTokens;
