import { color } from '../helpers/colorWrap.helper';
import { m } from '../measurementKit';
import { colorVars } from './global.componentTokens';

export const accordionSurfaceTokens = {
  gradientAngle: m(135, 'deg'),
  gradientStops: [
    { color: color('#160f24'), at: 0 },
    { color: color('#281532'), at: 100 },
  ] as const,
  gradientOpacity: 0.18,
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
