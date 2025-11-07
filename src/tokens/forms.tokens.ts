import { colorVars } from '@/styles/componentTokens/global.componentTokens';
import { m } from '@/styles/measurementKit';

export const formTokens = {
  layout: {
    maxWidth: m(640),
    fieldGap: m(12),
    sectionGap: m(16),
  },
  field: {
    paddings: {
      vertical: m(12),
      horizontal: m(16),
    },
    borders: {
      radius: m(12),
      width: m(1),
      color: colorVars.white.alpha(0.18),
    },
    hover: {
      borders: {
        color: colorVars.white.alpha(0.32),
      },
    },
    focusVisible: {
      shadow: [
        {
          blur: m(4),
          color: colorVars.brand.alpha(0.45),
        },
      ],
      outlines: {
        width: m(3),
        color: colorVars.brand.alpha(0.65),
      },
    },
    text: {
      color: colorVars.white.alpha(0.92),
    },
    error: {
      text: {
        color: colorVars.gradientA_secondary_end,
      },
      borders: {
        color: colorVars.gradientA_secondary_end.alpha(0.8),
      },
    },

    background: colorVars.white.alpha(0.06),
    placeholderColor: colorVars.white.alpha(0.55),
  },
  label: {
    textColor: colorVars.white.alpha(0.85),
  },
  message: {
    minChars: 10,
    maxChars: 2000,
    minRows: 5,
  },
  status: {
    success: {
      background: colorVars.brand.alpha(0.16),
      borderColor: colorVars.brand.alpha(0.45),
      textColor: colorVars.white,
    },
    error: {
      background: colorVars.gradientA_secondary_middle.alpha(0.18),
      borderColor: colorVars.gradientA_secondary_end.alpha(0.55),
      textColor: colorVars.white,
    },
    generic: {
      background: colorVars.shadow.alpha(0.3),
      borderColor: colorVars.white.alpha(0.35),
      textColor: colorVars.white,
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
    textColor: colorVars.white.alpha(0.7),
  },
  counter: {
    textColor: colorVars.white.alpha(0.65),
  },
} as const;

export type FormTokens = typeof formTokens;
