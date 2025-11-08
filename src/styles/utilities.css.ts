import { globalStyle } from '@vanilla-extract/css';
import type { CSS_TYPES } from '@/styles/helpers/types.helper';

globalStyle('*[data-visible="hidden"]', {
  visibility: 'hidden !important' as CSS_TYPES.Property.Visibility,
});

globalStyle('*[data-visible="sc-only"]', {
  position: 'absolute !important' as CSS_TYPES.Property.Position,
  width: '1px !important' as CSS_TYPES.Property.Width,
  height: '1px !important' as CSS_TYPES.Property.Height,
  padding: '0 !important' as CSS_TYPES.Property.Padding,
  margin: '-1px !important' as CSS_TYPES.Property.Margin,
  overflow: 'hidden !important' as CSS_TYPES.Property.Overflow,
  clip: 'rect(0,0,0,0) !important' as CSS_TYPES.Property.Clip,
  border: '0 !important' as CSS_TYPES.Property.Border,
});

globalStyle('*[data-interaction="none"]', {
  userSelect: 'none !important' as CSS_TYPES.Property.UserSelect,
  pointerEvents:
    'none !important' as CSS_TYPES.Property.PointerEvents,
});
