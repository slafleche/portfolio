import { m } from 'css-calipers';
import { logoVars } from './menu.tokens';

const contentPadding = logoVars.fullWidth;

export const layoutVars = {
  contentWidth: m(1400),
  contentPadding,

  noBleed: {
  	// contentWidth: m(1200),
  	// contentPadding: m(26),
  },
  // compact: {
  // 	contentWidth: m(1200),
  // 	contentPadding: m(26),
  // 	halfContentPadding: compactContentPadding.half(),
  // },
  // compressed: {
  // 	contentWidth: m(800),
  // 	contentPadding: m(16),
  // 	halfContentPadding: compressedContentPadding.half(),
  // },
} as const;

export const gridLayoutVars = {
  columns: 1,
  gap: m(6),
};
