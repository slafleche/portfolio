import { colorVars } from '@/styles/componentTokens/componentTokens.global';
import { m } from '@/styles/measurementKit';

export const formTokens = {
  layout: {
    maxWidth: m(640),
    fieldGap: m(12),
    sectionGap: m(16),
  },
  field: {
    paddingBlock: m(12),
    paddingInline: m(16),
    borderRadius: m(12),
    borderWidth: m(1),
    background: colorVars.white.alpha(0.06),
    borderColor: colorVars.white.alpha(0.18),
    textColor: colorVars.white.alpha(0.92),
    placeholderColor: colorVars.white.alpha(0.55),
    focusRingWidth: m(3),
    focusRingColor: colorVars.brand.alpha(0.65),
    hoverBorderColor: colorVars.white.alpha(0.32),
    errorBorderColor: colorVars.gradientA_secondary_end.alpha(0.8),
    errorTextColor: colorVars.gradientA_secondary_end,
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
    paddingInline: m(24),
    borderRadius: m(28),
  },
  privacy: {
    textColor: colorVars.white.alpha(0.7),
  },
  counter: {
    textColor: colorVars.white.alpha(0.65),
  },
} as const;

export type FormTokens = typeof formTokens;
