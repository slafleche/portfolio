import { color } from '@/styles/helpers/colorWrap.helper';
import { colorVars } from '@/tokens/global.tokens';
import { m } from 'css-calipers';
import { glassNoise } from '../styles/helpers/glassy.helper';

/**
 * Arch-specific glass settings derived from the shared glass
 * variables while keeping the nav look separate from generic panels.
 */
export const archGlassVars = {
  backgroundColor: colorVars.white.alpha(0.06),
  surfaceGlowPrimaryTint: color('#0f0c18').alpha(0.5),
  surfaceGlowSecondaryTint: color('#0f0c18').alpha(0.14),
  innerBorderColor: colorVars.white.alpha(0.12),
  backdropBlur: m(15),
  noiseDataUri: glassNoise(),
  overlay: {
    color: colorVars.white,
    topAlpha: 0.05,
    midStop: '45%',
    bottomAlpha: 0.2,
    direction: m(180, 'deg'),
  },
  outerBorderHighlight: {
    mPercent: m(100),
    angle: m(95, 'deg'),
    width: m(3),
    strength: 0.45,
  },
  innerBorderHighlight: {
    radialStrength: 0.45,
    wedgeStrength: 0.9,
    opacity: 0.55,
  },
  surfaceGlow: {
    blur: m(12),
    primaryTintAlpha: 0.25,
    secondaryTintAlpha: 0.25,
    opacity: 0.2,
  },
  border: {
    width: m(3),
    color: color('#ffffff'),
    hotspotPosition: 0.51,
    hotspotCoverage: 0.2,
    baseLeftAlpha: 0.1,
    baseMidAlpha: 0.3,
    peakAlpha: 0.3,
    baseRightAlpha: 0.2,
  },
};
