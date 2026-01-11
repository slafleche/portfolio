import { colorVars, spacingVars } from '../../tokens/global.tokens';

/**
 * Shared document-level styling data.
 *
 * Exposed through the modules layer so global styles don't reach into
 * component tokens directly.
 */
export const documentSurface = {
  palette: {
    body: {
      background: colorVars.bodyBg,
      foreground: colorVars.bodyFg,
    },
  },
  layout: {
    scrollPaddingOffset: spacingVars.scrollPaddingOffset,
  },
} as const;

export type DocumentSurface = typeof documentSurface;
