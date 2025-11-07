import type { ComplexStyleRule } from '@vanilla-extract/css';
import { m, mMs, mPercent } from '../measurementKit';
import { glassyButton, glassVars } from '../../tokens/glassy.tokens';
import borders from './borders';

type CssConvertible = {
  css: () => string;
};

const toCss = <Value>(value: Value): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}`;
  if (
    value &&
    typeof value === 'object' &&
    'css' in value &&
    typeof (value as CssConvertible).css === 'function'
  ) {
    return (value as CssConvertible).css();
  }
  throw new TypeError('Unsupported value passed to toCss');
};

const defaultGlassyControlTokens = {
  frame: {
    size: glassyButton.size,
    background: glassyButton.background,
    hoverBackground: glassyButton.hoverBackground,
    textColor: glassyButton.textColor,
    iconSize: glassyButton.iconSize,
    borders: {
      all: {
        width: glassyButton.borderWidth,
        color: glassyButton.borderColor,
        style: 'solid' as const,
      },
      radius: {
        all: glassyButton.borderRadius,
      },
    },
  },
  elevation: {
    shadowRest: glassyButton.shadowRest,
    shadowHover: glassyButton.shadowHover,
    focusRingWidth: glassyButton.focusRingWidth,
    focusRingColor: glassyButton.focusRingColor,
    transition: glassyButton.transition,
    backdropBlur: glassVars.backdropBlur,
  },
  motion: {
    hoverLift: m(2),
    activeLift: m(0),
    reducedMotionHoverLift: m(0),
  },
  sheen: {
    gradient:
      'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0) 100%)',
    inset: mPercent(-25),
    restTransform: 'skewX(45deg) translateX(220%)',
    activeTransform: 'skewX(45deg) translateX(-220%)',
    animationDuration: mMs(520),
    animationTiming: 'ease',
  },
  layout: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    iconOpacity: 0.85,
  },
} as const;

export type GlassyControlTokens = typeof defaultGlassyControlTokens;

export type GlassyControlOverrides = {
  frame?: Partial<GlassyControlTokens['frame']>;
  elevation?: Partial<GlassyControlTokens['elevation']>;
  motion?: Partial<GlassyControlTokens['motion']>;
  sheen?: Partial<GlassyControlTokens['sheen']>;
  layout?: Partial<GlassyControlTokens['layout']>;
};

export type ResolvedGlassyControlTokens = GlassyControlTokens;

export const resolveGlassyControlTokens = (
  overrides?: GlassyControlOverrides,
): ResolvedGlassyControlTokens => ({
  frame: {
    ...defaultGlassyControlTokens.frame,
    ...overrides?.frame,
  },
  elevation: {
    ...defaultGlassyControlTokens.elevation,
    ...overrides?.elevation,
  },
  motion: {
    ...defaultGlassyControlTokens.motion,
    ...overrides?.motion,
  },
  sheen: {
    ...defaultGlassyControlTokens.sheen,
    ...overrides?.sheen,
  },
  layout: {
    ...defaultGlassyControlTokens.layout,
    ...overrides?.layout,
  },
});

export type GlassyControlBaseOptions = {
  overrides?: GlassyControlOverrides;
  withTransformReset?: boolean;
};

/**
 * Generates the reusable base style block for a glassy control.
 * Consumers can pass a `style([...])` call the returned object to
 * compose.
 */
export const createGlassyControlBase = (
  options?: GlassyControlBaseOptions,
): ComplexStyleRule => {
  const resolved = resolveGlassyControlTokens(options?.overrides);

  const hoverLift = toCss(resolved.motion.hoverLift);
  const activeLift = toCss(resolved.motion.activeLift);
  const reducedLift = toCss(resolved.motion.reducedMotionHoverLift);

  const focusRingWidth = toCss(resolved.elevation.focusRingWidth);
  const focusRingColor = toCss(resolved.elevation.focusRingColor);

  const background = toCss(resolved.frame.background);
  const hoverBackground = toCss(resolved.frame.hoverBackground);
  const textColor = toCss(resolved.frame.textColor);

  const blur = toCss(resolved.elevation.backdropBlur);

  const size = toCss(resolved.frame.size);

  const transformReset = options?.withTransformReset
    ? { transform: 'translateY(0)' }
    : undefined;

  const borderStyles = borders(resolved.frame.borders);

  return {
    position: 'relative',
    width: size,
    height: size,
    display: resolved.layout.display,
    alignItems: resolved.layout.alignItems,
    justifyContent: resolved.layout.justifyContent,
    color: textColor,
    textDecoration: 'none',
    background,
    boxShadow: resolved.elevation.shadowRest,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: resolved.elevation.transition,
    backdropFilter: `blur(${blur})`,
    WebkitBackdropFilter: `blur(${blur})`,
    ...transformReset,
    ...borderStyles,
    selectors: {
      '&:hover': {
        background: hoverBackground,
        boxShadow: resolved.elevation.shadowHover,
        transform: `translateY(-${hoverLift})`,
      },
      '&:focus-visible': {
        outline: 'none',
        background: hoverBackground,
        boxShadow: `${resolved.elevation.shadowHover}, 0 0 0 ${focusRingWidth} ${focusRingColor}`,
        transform: `translateY(-${hoverLift})`,
      },
      '&:active': {
        transform: `translateY(-${activeLift})`,
        boxShadow: resolved.elevation.shadowRest,
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        selectors: {
          '&:hover': {
            transform: `translateY(-${reducedLift})`,
          },
          '&:focus-visible': {
            transform: `translateY(-${reducedLift})`,
          },
        },
      },
    },
  };
};

export type GlassyControlSheenRecipe = {
  base: ComplexStyleRule;
  activeState: {
    opacity: number;
    transform: string;
    animation: string;
  };
  reducedMotionState: {
    animation: 'none';
    transform: string;
    opacity: number;
  };
  keyframes: {
    from: {
      transform: string;
    };
    to: {
      transform: string;
    };
  };
};

export type GlassyControlSheenOptions = {
  overrides?: GlassyControlOverrides;
};

/**
 * Prepares a sheen overlay recipe that mirrors the default glassy
 * controls. Consumers can feed this into `style(...)` + `globalStyle`
 * as needed.
 */
export const createGlassyControlSheen = (
  options?: GlassyControlSheenOptions,
): GlassyControlSheenRecipe => {
  const resolved = resolveGlassyControlTokens(options?.overrides);

  const inset = toCss(resolved.sheen.inset);
  const duration = toCss(resolved.sheen.animationDuration);

  return {
    base: {
      position: 'absolute',
      inset,
      background: resolved.sheen.gradient,
      transform: resolved.sheen.restTransform,
      opacity: 0,
      pointerEvents: 'none',
    },
    activeState: {
      opacity: 1,
      transform: resolved.sheen.activeTransform,
      animation: `${duration} ${resolved.sheen.animationTiming}`,
    },
    reducedMotionState: {
      animation: 'none',
      transform: resolved.sheen.restTransform,
      opacity: 0,
    },
    keyframes: {
      from: {
        transform: resolved.sheen.restTransform,
      },
      to: {
        transform: resolved.sheen.activeTransform,
      },
    },
  };
};

export type GlassyIconOptions = {
  overrides?: GlassyControlOverrides;
};

/**
 * Provides a default icon styling block that keeps icon sizing in
 * sync with the control tokens.
 */
export const createGlassyControlIcon = (
  options?: GlassyIconOptions,
): ComplexStyleRule => {
  const resolved = resolveGlassyControlTokens(options?.overrides);
  const iconSize = toCss(resolved.frame.iconSize);

  return {
    width: iconSize,
    height: iconSize,
    display: 'inline-block',
    opacity: resolved.layout.iconOpacity,
    position: 'relative',
    zIndex: 1,
  };
};
