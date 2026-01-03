import { m } from 'css-calipers';
import { anchorMenuVars, logoVars } from './menu.tokens';

const contentPadding = logoVars.fullWidth.add(
  anchorMenuVars.borders.width,
);

const separatorMinimum = m(300);

export const layoutVars = {
  contentWidth: m(1600),
  contentPadding,

  noEdge: {
    contentWidth: m(1200),
    contentPadding: m(26),
  },
  compact: {
    contentWidth: m(800),
    contentPadding: m(26),
  },
  // compressed: {
  // 	contentWidth: m(800),
  // 	contentPadding: m(16),
  // 	halfContentPadding: compressedContentPadding.half(),
  // },
} as const;

export const gridLayoutVars = {
  columns: 1,
  gap: m(24),
  separatorMinimum,
};
