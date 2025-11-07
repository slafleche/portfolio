import { m } from '../styles/measurementKit';
import { layoutVars } from '../styles/componentTokens/layout.componentTokens';
import { colorVars } from '../styles/componentTokens/global.componentTokens';
import { glassVars } from './glassy.tokens';

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
    // fontSize: 'clamp(2.25rem, 5vw, 3rem)',
    // fontWeight: 700,
    color: colorVars.white,
  },
  updated: {
    color: colorVars.white.alpha(0.65),
    // fontSize: '0.95rem',
  },
  backLink: {
    offset: m(12),
    size: glassVars.action.size,
    borders: {
      width: glassVars.borderWidth,
      color: glassVars.borderColor,
      radius: glassVars.borderRadius,
    },
    background: glassVars.action.background,
    hover: {
      background: glassVars.action.hoverBackground,
    },
    text: {
      color: glassVars.action.textColor,
    },
    iconSize: glassVars.action.iconSize,
    shadow: {
      rest: glassVars.action.shadowRest,
      hover: glassVars.action.shadowHover,
    },
    focus: {
      outlines: {
        width: glassVars.action.focusRingWidth,
        color: glassVars.action.focusRingColor,
      },
    },
    transition: glassVars.action.transition,
    backdropBlur: glassVars.backdropBlur,
    sheen:
      'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 100%)',
  },
} as const;

export type PrivacyTokens = typeof privacyTokens;
