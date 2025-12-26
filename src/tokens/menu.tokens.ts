import { m, mPercent } from 'css-calipers';
import { colorVars } from './global.tokens';

export const logoVars = {
  width: m(45),
  offsetY: m(0),
  offsetX: m(0),
  borders: {
    radius: mPercent(50),
    width: m(1),
    color: colorVars.white.alpha(0.5),
  },
};

export const localeSwitcherVars = {
  fontSize: m(14),
  offsetY: m(8),
  offsetX: m(12),
  width: m(32),
  height: m(32),
  color: colorVars.white.alpha(0.8),
};

const anchorOuterGap = m(12);
const safeMargin = logoVars.width
  .add(logoVars.offsetY.multiply(2))
  .add(anchorOuterGap);
const dotSize = m(16);
const dotPadding = m(10);
const handleHeight = dotPadding.multiply(2).add(dotSize);

const anchorMenuVars = {
  size: dotSize,
  innerGap: m(10),
  borders: {
    radius: mPercent(50),
    width: m(1),
    color: colorVars.white.alpha(0.5),
  },
  margins: {
    vertical: safeMargin,
    left: m(12),
  },
  dot: {
    paddings: dotPadding,
    fontSize: dotSize,
    lineHeight: 1,
  },
  handle: {
    size: handleHeight,
  },
};

export { anchorMenuVars };
