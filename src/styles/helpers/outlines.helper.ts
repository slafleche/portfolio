import type { IMeasurement } from 'css-calipers';

import type { CSS_TYPES } from '@/styles/helpers/types.helper';

import { outlinesTokens } from '../../tokens/outlines.tokens';
import { isColorWrapper, type ColorWrapper } from './colorWrap.helper';

export type OutlinesValues = {
  color?: ColorWrapper | CSS_TYPES.Property.OutlineColor;
  width?: IMeasurement;
  offset?: IMeasurement;
  style?: CSS_TYPES.Property.OutlineStyle;
};

const {
  defaults: {
    color: defaultColor,
    width: defaultWidth,
    offset: defaultOffset,
    style: defaultStyle,
  },
} = outlinesTokens;

const resolveOutlineColor = (
  value: ColorWrapper | CSS_TYPES.Property.OutlineColor,
) => (isColorWrapper(value) ? value.css() : value);

export const outlines = ({
  color: outlineColor = defaultColor,
  width = defaultWidth,
  offset = defaultOffset,
  style = defaultStyle,
}: OutlinesValues = {}) => ({
  outline: `${width.css()} ${style} ${resolveOutlineColor(
    outlineColor,
  )}`,
  outlineOffset: offset.css(),
});
