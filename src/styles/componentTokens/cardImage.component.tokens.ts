import {
  dropShadowVars,
  colorVars,
} from '../../tokens/global.tokens';
import { m, mPercent } from 'css-calipers';

export const cardImageVars = {
  borders: {
    width: m(2),
    color: colorVars.bodyFg,
  },
  shadows: {
    inner: {
      offsetX: dropShadowVars.offsetX,
      offsetY: dropShadowVars.offsetY,
      blur: dropShadowVars.blur,
      color: dropShadowVars.color,
    },
    outer: {
      offsetX: dropShadowVars.offsetX,
      offsetY: dropShadowVars.offsetY,
      blur: dropShadowVars.blur,
      color: dropShadowVars.color,
    },
  },
  image: {
    scale: 1.1,
    positionX: mPercent(70),
    positionY: mPercent(70),
  },
} as const;
