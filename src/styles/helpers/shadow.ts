import { Color } from 'chroma-js';
import { colorVars, dropShadowVars } from '../vars';
import { IMeasurement } from './measurement';
export interface IBoxShadow {
  x?: IMeasurement;
  y?: IMeasurement;
  blur?: IMeasurement;
  spread?: IMeasurement;
  inset?: boolean;
  color?: Color;
}

// Will default to global set of default value
export const globalBoxShadow = (props: IBoxShadow = {}) => {
  const {
    x = dropShadowVars.offsetX,
    y = dropShadowVars.offsetY,
    blur = dropShadowVars.blur,
    spread = dropShadowVars.spread,
    color = colorVars.shadow,
    inset = false,
  } = props || {};
  return `${x.css()} ${y.css()} ${blur.css()} ${spread.css()} ${color.css()}${inset ? ' inset' : ''}`;
};
