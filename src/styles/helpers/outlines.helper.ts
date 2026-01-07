import type { IMeasurement } from 'css-calipers';

import type { CSS_TYPES } from '@/styles/helpers/types.helper';

import { outlinesTokens } from '../../tokens/outlines.tokens';
import type { ColorWrapper } from './colorWrap.helper';

export type OutlinesValues = {
  color?: ColorWrapper;
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

export const outlines = ({
  color: outlineColor = defaultColor,
  width = defaultWidth,
  offset = defaultOffset,
  style = defaultStyle,
}: OutlinesValues = {}) => ({
  outline: `${width.css()} ${style} ${outlineColor.css()}`,
  outlineOffset: offset.css(),
});
