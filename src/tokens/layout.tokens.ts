import { m } from 'css-calipers';

import { anchorMenuVars, logoVars } from './menu.tokens';

const defaultContentWidth = m(1200);
const contentPadding = logoVars.fullWidth.add(
  anchorMenuVars.borders.width,
);

const separatorMinimum = m(300);

export const layoutVars = {
  content: {
    width: defaultContentWidth,
    padding: contentPadding,
    widthWithPadding: contentPadding,
    gap: m(48),
  },
  // contentWidth: defaultContentWidth,
  // contentPadding,
  // contentWidthWithPadding: contentPadding,

  noEdge: {
    contentPadding: m(26),
  },
  snug: {
    maxWidth: m(1000),
  },
  compact: {
    maxWidth: m(800),
  },
  compressed: {
    maxWidth: m(600),
  },
} as const;

export const gridLayoutVars = {
  columns: 1,
  gap: m(24),
  separatorMinimum,
};

const formInnerPadding = m(100);
const formInnerCompactPadding = anchorMenuVars.handle.size.half();

export const formLayoutVars = {
  maxWidth: layoutVars.compact.maxWidth.add(
    formInnerPadding.double(),
  ),
  innerPadding: formInnerPadding,
  compact: {
    maxWidth: layoutVars.compact.maxWidth.add(
      formInnerCompactPadding.double(),
    ),
    innerPadding: formInnerCompactPadding,
  },
};
