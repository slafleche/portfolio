import type { CSS_TYPES } from '@/styles/helpers/types.helper';
import type { ColorWrapper } from './colorWrap.helper';
import { m, type IMeasurement } from 'css-calipers';
import {
  dropShadowVars,
  colorVars,
} from '../../tokens/global.tokens';
export interface IBoxShadow {
  x?: IMeasurement;
  y?: IMeasurement;
  blur?: IMeasurement;
  spread?: IMeasurement;
  alpha?: number;
  inset?: boolean;
  color?: ColorWrapper;
}

// Will default to global set of default value
const formatBoxShadow = (props: IBoxShadow = {}) => {
  const {
    x = dropShadowVars.offsetX,
    y = dropShadowVars.offsetY,
    blur = dropShadowVars.blur,
    color = dropShadowVars.color,
    alpha = dropShadowVars.alpha,
    inset = false,
  } = props || {};
  const finalColor =
    alpha || alpha !== 1 ? color.alpha(alpha) : color;
  return `${x.css()} ${y.css()} ${blur.css()} 0 ${finalColor.css()}${inset ? ' inset' : ''}`;
};

export type IBoxShadowTokens =
  | IBoxShadow
  | ReadonlyArray<IBoxShadow>;

const isBoxShadowList = (
  input: IBoxShadowTokens,
): input is ReadonlyArray<IBoxShadow> => Array.isArray(input);

const boxShadowValue = (
  input: IBoxShadowTokens = {},
): CSS_TYPES.Property.BoxShadow => {
  if (isBoxShadowList(input)) {
    return input
      .map((entry) => formatBoxShadow(entry))
      .join(', ') as CSS_TYPES.Property.BoxShadow;
  }
  return formatBoxShadow(
    input,
  ) as CSS_TYPES.Property.BoxShadow;
};

type BoxShadowComposer = {
  (
    input?: IBoxShadowTokens,
  ): {
    boxShadow: CSS_TYPES.Property.BoxShadow;
  };
  value: typeof boxShadowValue;
};

export const boxShadow = ((input: IBoxShadowTokens = {}) => ({
  boxShadow: boxShadowValue(input),
})) as BoxShadowComposer;

boxShadow.value = boxShadowValue;

// CSS filter: drop-shadow() helper, using global defaults
export const globalDropShadowFilter = (props: IBoxShadow = {}) => {
  const {
    x = dropShadowVars.offsetX,
    y = dropShadowVars.offsetY,
    blur = dropShadowVars.blur,
    // spread not supported by drop-shadow()
    color = colorVars.shadow,
  } = props || {};
  return `drop-shadow(${x.css()} ${y.css()} ${blur.css()} ${color.css()})`;
};

// Fudged CSS drop-shadow that avoids a flush-side gap by layering
// an unshifted blur under the shifted shadow. No extra path or SVG merge.
export const globalDropShadowFilterFlush = (
  props: IBoxShadow = {},
) => {
  const {
    x = dropShadowVars.offsetX,
    y = dropShadowVars.offsetY,
    blur = dropShadowVars.blur,
    color = dropShadowVars.color,
  } = props || {};
  const base = `drop-shadow(0 0 ${blur.css()} ${color.css()})`;
  const shifted = `drop-shadow(${x.css()} ${y.css()} ${blur.css()} ${color.css()})`;
  return `${base} ${shifted}`;
};

// Convenience: total vertical span needed for the shadow (offsetY + 2 * blur)
// Useful for padding viewBox/filter regions to avoid clipping
export const shadowTotalY = (
  props: IBoxShadow = {},
): IMeasurement => {
  const y = props.y ?? dropShadowVars.offsetY;
  const blur = props.blur ?? dropShadowVars.blur;
  const unit = y.getUnit();
  y.assertUnit(unit, 'shadowTotalY offsetY');
  blur.assertUnit(unit, 'shadowTotalY blur');
  return m(y.getValue() + 2 * blur.getValue(), unit);
};

// Convenience: total horizontal span needed for the shadow (offsetX + 2 * blur)
export const shadowTotalX = (
  props: IBoxShadow = {},
): IMeasurement => {
  const x = props.x ?? dropShadowVars.offsetX;
  const blur = props.blur ?? dropShadowVars.blur;
  const unit = x.getUnit();
  x.assertUnit(unit, 'shadowTotalX offsetX');
  blur.assertUnit(unit, 'shadowTotalX blur');
  return m(x.getValue() + 2 * blur.getValue(), unit);
};
