import type { CSS_TYPES } from '@/styles/helpers/types.helper';
import { color } from '../styles/helpers/colorWrap.helper';
import { m } from 'css-calipers';

export const outlinesTokens = {
  defaults: {
    color: color('currentColor'),
    width: m(2),
    offset: m(2),
    style: 'solid' as CSS_TYPES.Property.OutlineStyle,
  },
} as const;

export type OutlinesTokens = typeof outlinesTokens;
