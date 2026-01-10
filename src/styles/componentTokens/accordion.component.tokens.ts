import { m, mMs, mPercent } from 'css-calipers';

import { colorVars, themeColours } from '../../tokens/global.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { color } from '../helpers/colorWrap.helper';

export const accordionSurfaceTokens = {
  gradientAngle: m(171, 'deg'),
  gradientStops: [
    {
      color: themeColours.gradients.main.start,
      at: mPercent(0),
    },
    {
      color: themeColours.gradients.main.middle,
      at: mPercent(48),
    },
    {
      color: themeColours.gradients.main.end,
      at: mPercent(100),
    },
  ] as const,
  gradientOpacity: 1,
  borders: {
    radius: m(18),
    width: m(1),
    color: colorVars.white.alpha(0.2),
  },
  paddings: {
    horizontal: m(6),
    vertical: m(6),
  },
  drawer: {
    borders: {
      bottom: {
        color: colorVars.white.alpha(0.1),
        width: m(1),
      },
    },
  },
  gap: m(3),
} as const;

export const accordionItemTokens = {
  borderRadius: m(12),
  animation: {
    slide: {
      open: {
        timing: mMs(220),
        easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`,
      },
      closed: {
        timing: mMs(180),
        easing: `cubic-bezier(0.5, 0, 0.75, 0.2)`,
      },
    },
  },
  button: {
    size: m(44),
    spacing: m(12),
    paddings: {
      top: m(25),
      left: anchorMenuVars.handle.sizeWithBorder,
      right: m(12),
      bottom: m(20),
    },
  },
  icon: {
    size: m(22),
  },
  content: {
    color: colorVars.white.css(),
    backgroundColor: color('#200a2e').darken(0.1).alpha(0.9),
    paddings: {
      top: m(4),
      horizontal: anchorMenuVars.handle.sizeWithBorder,
      bottom: anchorMenuVars.handle.sizeWithBorder
        .multiply(0.8)
        .round(0),
    },
  },
  rightArrow: {
    size: m(36),
    color: themeColours.lights.e.mix(themeColours.electricBlue, 0.7),
  },
} as const;
