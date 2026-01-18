import { m } from 'css-calipers';

import type { CSS_TYPES } from '@/styles/helpers/types.helper';

export const outlinesTokens = {
  defaults: {
    color: 'Highlight' as CSS_TYPES.Property.OutlineColor,
    width: m(4),
    offset: m(2),
    style: 'solid' as CSS_TYPES.Property.OutlineStyle,
  },
} as const;

export type OutlinesTokens = typeof outlinesTokens;
