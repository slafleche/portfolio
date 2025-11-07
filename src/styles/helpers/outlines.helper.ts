import type * as CSS from 'csstype';
import type { ColorWrapper } from './colorWrap.helper';
import type { IMeasurement } from '../measurementKit';
import { outlinesTokens } from '../../tokens/outlines.tokens';

export type FocusOutlineOptions = {
  color?: ColorWrapper;
  width?: IMeasurement;
  offset?: IMeasurement;
  style?: CSS.Property.OutlineStyle;
};

const {
  defaults: {
    color: defaultColor,
    width: defaultWidth,
    offset: defaultOffset,
    style: defaultStyle,
  },
} = outlinesTokens;

export const outlines = ({
  color: outlineColor = defaultColor,
  width = defaultWidth,
  offset = defaultOffset,
  style = defaultStyle,
}: FocusOutlineOptions = {}) => ({
  outline: `${width.css()} ${style} ${outlineColor.css()}`,
  outlineOffset: offset.css(),
});
