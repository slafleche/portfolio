import { m } from '../styles/measurementKit';
import { layoutVars } from '../styles/componentTokens/componentTokens.layout';
import { colorVars } from '../styles/componentTokens/componentTokens.global';
import { glassyActionTokens, glassVars } from '../styles/helpers/glassy';

const horizontalPadding = m(24);

export const privacyTokens = {
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
    fontSize: 'clamp(2.25rem, 5vw, 3rem)',
    fontWeight: 700,
    color: colorVars.white,
  },
  updated: {
    color: colorVars.white.alpha(0.65),
    fontSize: '0.95rem',
  },
  backLink: {
    offset: m(12),
    size: glassyActionTokens.size,
    borders: {
      intent: {
        all: {
          width: glassyActionTokens.borderWidth,
          color: glassyActionTokens.borderColor,
          style: 'solid' as const,
        },
        radius: {
          all: glassyActionTokens.borderRadius,
        },
      },
    },
    background: glassyActionTokens.background,
    hoverBackground: glassyActionTokens.hoverBackground,
    textColor: glassyActionTokens.textColor,
    iconSize: glassyActionTokens.iconSize,
    fontWeight: 600,
    shadowRest: glassyActionTokens.shadowRest,
    shadowHover: glassyActionTokens.shadowHover,
    focusRingWidth: glassyActionTokens.focusRingWidth,
    focusRingColor: glassyActionTokens.focusRingColor,
    transition: glassyActionTokens.transition,
    backdropBlur: glassVars.backdropBlur,
    sheen:
      'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 100%)',
  },
} as const;

export type PrivacyTokens = typeof privacyTokens;
