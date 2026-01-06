import { m, mPercent } from 'css-calipers';
import { colorVars, themeColours } from '../../tokens/global.tokens';
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
    width: m(0.75),
    color: colorVars.white.alpha(0.18),
  },
  paddings: {
    horizontal: m(6),
    vertical: m(6),
  },
  drawerBackgrounds: {
    color: color('#912eee'),
  },
  gap: m(3),
} as const;

export const accordionItemTokens = {
  borderRadius: m(12),
  handle: {
    // paddings: {},
    spacing: m(8),
  },
  paddings: {
    horizontal: m(8),
    vertical: m(4),
  },
  rightArrow: {
    size: m(44),
    color: themeColours.secondary.lighten(0.5),
  },
  chevronSize: m(44),
} as const;
