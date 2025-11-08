import { globalStyle } from '@vanilla-extract/css';
import type { CSS } from '@/styles/helpers/types.helper';

globalStyle('*[data-visible="hidden"]', {
  visibility: 'hidden !important' as CSS.Property.Visibility,
});

globalStyle('*[data-visible="sc-only"]', {
  position: 'absolute !important' as CSS.Property.Position,
  width: '1px !important' as CSS.Property.Width,
  height: '1px !important' as CSS.Property.Height,
  padding: '0 !important' as CSS.Property.Padding,
  margin: '-1px !important' as CSS.Property.Margin,
  overflow: 'hidden !important' as CSS.Property.Overflow,
  clip: 'rect(0,0,0,0) !important' as CSS.Property.Clip,
  border: '0 !important' as CSS.Property.Border,
});

globalStyle('*[data-interaction="none"]', {
  userSelect: 'none !important' as CSS.Property.UserSelect,
  pointerEvents: 'none !important' as CSS.Property.PointerEvents,
});
