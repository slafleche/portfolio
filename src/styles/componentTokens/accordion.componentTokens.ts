import { color } from '../helpers/colorWrap.helper';
import { m, mPercent } from 'css-calipers';
import { colorVars, themeColours } from '../../tokens/global.tokens';

export const accordionSurfaceTokens = {
  gradientAngle: m(180, 'deg'),
  gradientStops: [
    {
      color: themeColours.gradients.main.start,
      at: mPercent(0),
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
  gap: m(3),
} as const;

export const accordionItemTokens = {
  borderRadius: m(12),
  gap: m(2),
  paddingX: m(4),
  paddingY: m(4),
  iconSize: m(44),
} as const;
