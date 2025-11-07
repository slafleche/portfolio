import type * as CSS from 'csstype';
import { color } from '../styles/helpers/colorWrap.helper';
import { m } from '../styles/measurementKit';

export const outlinesTokens = {
  defaults: {
    color: color('currentColor'),
    width: m(2),
    offset: m(2),
    style: 'solid' as CSS.Property.OutlineStyle,
  },
} as const;

export type OutlinesTokens = typeof outlinesTokens;
