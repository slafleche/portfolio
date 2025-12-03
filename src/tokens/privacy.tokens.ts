import { m } from '../styles/measurementKit';
import { colorVars } from './global.tokens';
import { glassVars, glassyButtonTokens } from './glassy.tokens';
import { layoutVars } from './layout.tokens';

const horizontalPadding = m(24);

export const privacyTokens = {
  blur: glassVars.blur,
  layout: {
    maxWidth: layoutVars.contentWidth,
    paddings: {
      horizontal: horizontalPadding,
      top: m(36),
      bottom: m(48),
    },
    sectionGap: m(24),
  },
  header: {
    gap: m(8),
  },
  title: {
    color: colorVars.white,
  },
  updated: {
    color: colorVars.white.alpha(0.65),
  },
  backLink: {
    offset: m(12),
    size: glassyButtonTokens.size,
    //   backdropBlur: glassVars.blur,
    //   borders: glassyButtonTokens.borders,
    //   backgrounds: glassyButtonTokens.backgrounds,
    //   hover: {
    //     backgrounds: glassyButtonTokens.hover.backgrounds,
    //   },
    text: {
      color: glassyButtonTokens.text.color,
    },
    iconSize: glassyButtonTokens.iconSize,
    //   transition: glassyButtonTokens.transition,
    //   sheen:
    //     'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 100%)',
  },
} as const;

export type PrivacyTokens = typeof privacyTokens;
