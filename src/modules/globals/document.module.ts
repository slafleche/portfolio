import {
  archVars,
  colorVars,
  spacingVars,
} from '../../styles/componentTokens/global.componentTokens';

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
    arch: archVars,
    scrollPaddingOffset: spacingVars.scrollPaddingOffset,
  },
} as const;

export type DocumentSurface = typeof documentSurface;
