import { measurement } from './helpers/measurement';

const contentPadding = measurement('40px');
const compactContentPadding = measurement('26px');
const compressedContentPadding = measurement('16px');

export const layoutVars = {
  contentWidth: '1400px',
  contentPadding: contentPadding.toString(),
  halfContentPadding: measurement(
    contentPadding,
    contentPadding.val / 2,
  ).toString(),
  // Tigher padding
  compact: {
    contentWidth: '1200px',
    contentPadding: '26px',
    halfContentPadding: measurement(
      compactContentPadding,
      compressedContentPadding.val / 2,
    ).toString(),
  },
  // Very tight padding
  compressed: {
    contentWidth: '800px',
    contentPadding: '16px',
    halfContentPadding: measurement(
      compressedContentPadding,
      compressedContentPadding.val / 2,
    ).toString(),
  },
};
