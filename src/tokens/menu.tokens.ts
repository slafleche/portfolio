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

const anchorOuterGap = m(12);
const safeMargin = logoVars.width
  .add(logoVars.offsetY.multiply(2))
  .add(anchorOuterGap);

const anchorMenuVars = {
  size: m(16),
  innerGap: m(8),
  borders: {
    radius: mPercent(50),
    width: m(1),
    color: colorVars.white.alpha(0.5),
  },
  margins: {
    vertical: safeMargin,
    left: m(12),
  },
};

export { anchorMenuVars };
