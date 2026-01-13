import { m } from 'css-calipers';

import { colorVars, themeColours } from '@/tokens/global.tokens';

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
      vertical: m(6),
      horizontal: m(0),
    },
    borders: {
      top: {
        width: m(0),
        color: colorVars.transparent,
      },
      horizontal: {
        width: m(0),
        color: colorVars.transparent,
      },
      bottom: {
        width: m(2),
        color: colorVars.white.alpha(0.35),
      },
    },
    hover: {
      borders: {
        bottom: {
          color: themeColours.secondary,
        },
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
        bottom: {
          color: colorVars.brand.alpha(0.65),
        },
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
      vertical: m(6),
      horizontal: m(8),
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
