import { m, mPercent } from 'css-calipers';

import {
  colors,
  colorVars,
  themeColours,
} from '@/tokens/global.tokens';

import { glassyButtonTokens } from './glassy.tokens';
import { layoutVars } from './layout.tokens';

const closeOffset = m(16);
const contactFormHeaderHeight = glassyButtonTokens.size.add(
  closeOffset.double(),
);

export const formVars = {
  header: {
    height: contactFormHeaderHeight,
    closeOffset: closeOffset,
  },
  textarea: {
    minHeight: m(250),
    compact: {
      minHeight: m(150),
    },
  },
  label: {
    text: {
      color: colorVars.white.alpha(0.85),
      fontSize: m(16),
    },
  },
  layout: {
    maxWidth: layoutVars.compact.maxWidth,
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
      top: m(12),
      horizontal: m(0),
      bottom: m(8),
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
      icon: {
        color: colorVars.brand,
      },
      backgrounds: {
        color: colorVars.brand.alpha(0.16),
      },
      borders: {
        color: colorVars.brand.alpha(0.45),
      },
    },
    error: {
      icon: {
        color: colorVars.gradientA_secondary_middle,
      },
      backgrounds: {
        color: colorVars.gradientA_secondary_middle.alpha(0.18),
      },
      borders: {
        color: colorVars.gradientA_secondary_end.alpha(0.55),
      },
    },
    loading: {
      icon: {
        // color: colors.white,
      },
      backgrounds: {
        // color: colorVars.gradientA_secondary_middle.alpha(0.18),
      },
      borders: {
        // color: colorVars.gradientA_secondary_end.alpha(0.55),
      },
    },
  },
  button: {
    minHeight: m(48),
    paddings: {
      vertical: m(8),
      horizontal: m(9),
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
      background: colors.white.alpha(0.05),
      border: {
        width: m(1),
        color: colors.white.alpha(0.1),
        radius: [
          mPercent(50),
          mPercent(40),
        ],
      },
    },
    body: {
      color: colorVars.white.alpha(0.82),
    },
  },
  errorPanel: {
    icon: {
      color: colorVars.errorAccent,
      detail: {
        color: colorVars.errorAccent.mix(colors.status.error, 0.8),
      },
      background: colors.white.alpha(0.05),
      border: {
        width: m(1),
        color: colors.white.alpha(0.1),
        radius: [
          mPercent(50),
          mPercent(40),
        ],
      },
    },
    body: {
      color: colorVars.white.alpha(0.82),
    },
  },
} as const;

export type FormTokens = typeof formVars;
