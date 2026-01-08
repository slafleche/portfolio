import { m } from 'css-calipers';

// layout
const logoContainerMinWidth = m(200);

export const cardLayout = {
  grid: {
    gap: m(24),
  },
  logoBox: {
    minWidth: logoContainerMinWidth,
    paddings: m(20),
    mobile: {
      paddings: m(20),
    },
  },
  content: {},

  oneColumn: {
    maxWidth: m(800),
  },
};
