import type { CSS } from '@/styles/helpers/types.helper';
import type { ColorWrapper } from './colorWrap.helper';
import type { IMeasurement } from '../measurementKit';
import { outlinesTokens } from '../../tokens/outlines.tokens';

export type OutlinesValues = {
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
}: OutlinesValues = {}) => ({
  outline: `${width.css()} ${style} ${outlineColor.css()}`,
  outlineOffset: offset.css(),
});
