import { m, mPercent } from 'css-calipers';

import type { ITextShadow } from '../styles/helpers/shadow.helper';
import { colorVars } from './global.tokens';

const logoWidth = m(48);
const offsetY = m(12);
const offsetX = m(12);
const fullWidth = logoWidth.add(offsetX).add(offsetY);

export const logoVars = {
  width: logoWidth,
  fullWidth,
  offsetY,
  offsetX,
  borders: {
    radius: mPercent(50),
    width: m(1),
    color: colorVars.white.alpha(0.5),
  },
  compact: {
    width: m(50),
    offsetX: m(16),
    offsetY: m(16),
  },
};

export const localeSwitcherVars = {
  fontSize: m(14),
  offsetY: m(8),
  offsetX: m(12),
  width: m(32),
  height: m(32),
  color: colorVars.white.alpha(0.8),
  shadow: colorVars.shadow,
};

const anchorOuterGap = m(12);
const safeMargin = logoVars.width
  .add(logoVars.offsetY.multiply(2))
  .add(anchorOuterGap);
const dotSize = m(16);

const borderSize = m(1);
const dotPadding = logoVars.offsetY.add(borderSize);
const handleHeight = dotPadding.multiply(2).add(dotSize);
const handleSizeWithBorder = handleHeight.add(borderSize.multiply(2));

export const anchorMenuVars = {
  size: dotSize,
  innerGap: m(10),
  borders: {
    radius: mPercent(50),
    width: borderSize,
    color: colorVars.white.alpha(0.5),
  },
  margins: {
    vertical: safeMargin,
  },
  dot: {
    paddings: dotPadding,
    fontSize: dotSize,
    lineHeight: 1,
    borders: {
      width: m(1),
      color: colorVars.white.alpha(0.8),
      radius: mPercent(50),
    },
  },
  handle: {
    size: handleHeight,
    sizeWithBorder: handleSizeWithBorder,
    spacing: dotPadding.add(borderSize.multiply(2)),
  },
  text: {
    textShadow: {
      x: m(1),
      y: m(1),
      blur: m(1),
      color: colorVars.shadow,
    } as ITextShadow,
  },
};
