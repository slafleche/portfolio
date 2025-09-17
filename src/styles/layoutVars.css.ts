import { m, modify } from './helpers/measurement';

const contentPadding = m(40);
const compactContentPadding = m(26);
const compressedContentPadding = m(16);

export const layoutVars = {
  contentWidth: '1400px',
  contentPadding: contentPadding.css(),
  halfContentPadding: modify(contentPadding, contentPadding.value / 2).css(),
  // Tigher padding
  compact: {
    contentWidth: '1200px',
    contentPadding: '26px',
    halfContentPadding: modify(
      compactContentPadding,
      compressedContentPadding.value / 2,
    ).css(),
  },
  // Very tight padding
  compressed: {
    contentWidth: '800px',
    contentPadding: '16px',
    halfContentPadding: modify(
      compressedContentPadding,
      compressedContentPadding.value / 2,
    ).css(),
  },
};
