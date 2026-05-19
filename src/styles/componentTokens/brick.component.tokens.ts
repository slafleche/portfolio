import { m } from 'css-calipers';

export const bricksLayout = {
  grid: {
    gap: m(24),
    desktop: {
      columns: 'repeat(2, minmax(0, 1fr))',
      rows: 2,
    },
  },
  breakpoints: {
    twoColumn: m(1200),
    oneColumn: m(740),
  },
};

export const brickLayout = {
  paddings: m(36),
};
