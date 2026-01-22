import { globalStyle } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import type { CSS_TYPES } from '@/styles/helpers/types.helper';

import { important } from './helpers/important.helper';
import { margins, paddings } from './helpers/spacing.helper';

globalStyle('*[data-visible="hidden"]', {
  visibility: 'hidden !important' as CSS_TYPES.Property.Visibility,
  height: '0 !important' as CSS_TYPES.Property.Height,
  overflow: 'hidden !important' as CSS_TYPES.Property.Overflow,
});

globalStyle('*[data-visible="sc-only"]', {
  position: 'absolute !important' as CSS_TYPES.Property.Position,
  width: '1px !important' as CSS_TYPES.Property.Width,
  height: '1px !important' as CSS_TYPES.Property.Height,
  ...important(paddings(m(0))),
  ...important(margins(m(-1))),
  overflow: 'hidden !important' as CSS_TYPES.Property.Overflow,
  clip: 'rect(0,0,0,0) !important' as CSS_TYPES.Property.Clip,
  border: 'none !important' as CSS_TYPES.Property.Border,
  whiteSpace: 'nowrap !important' as CSS_TYPES.Property.WhiteSpace,
});

globalStyle('*[data-interaction="none"]', {
  userSelect: 'none !important' as CSS_TYPES.Property.UserSelect,
  pointerEvents:
    'none !important' as CSS_TYPES.Property.PointerEvents,
});

globalStyle('*[data-white-space="no-wrap"]', {
  whiteSpace: 'nowrap !important' as CSS_TYPES.Property.WhiteSpace,
});
