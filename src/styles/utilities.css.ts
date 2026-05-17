import { globalStyle } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import type { CSS_TYPES } from '@/styles/helpers/types.helper';

import { important } from './helpers/important.helper';
import { margins, paddings } from './helpers/spacing.helper';

globalStyle('*[data-visible="hidden"]', {
  visibility: 'hidden !important' as CSS_TYPES.Property.Visibility,
  height: '0 !important',
  overflow: 'hidden !important',
});

globalStyle('*[data-visible="sc-only"]', {
  position: 'absolute !important' as CSS_TYPES.Property.Position,
  width: '1px !important',
  height: '1px !important',
  ...important(paddings(m(0))),
  ...important(margins(m(-1))),
  overflow: 'hidden !important',
  clip: 'rect(0,0,0,0) !important',
  border: 'none !important',
  whiteSpace: 'nowrap !important',
});

globalStyle('*[data-interaction="none"]', {
  userSelect: 'none !important' as CSS_TYPES.Property.UserSelect,
  pointerEvents:
    'none !important' as CSS_TYPES.Property.PointerEvents,
});

globalStyle('*[data-white-space="no-wrap"]', {
  whiteSpace: 'nowrap !important',
});
