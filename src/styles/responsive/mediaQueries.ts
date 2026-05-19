import type { StyleRule } from '@vanilla-extract/css';
import {
  defineMediaQueryModules,
  type IMediaQueries,
  mediaQueryFactory,
  outputVanillaExtract,
  preprocessorVanillaExtract,
} from 'css-calipers/mediaQueries';

import {
  formLayoutVars,
  layoutVars,
} from '../../tokens/layout.tokens';
import { bricksLayout } from '../componentTokens/brick.component.tokens';
import { cardLayout } from '../componentTokens/card.component.tokens';
import { footerVars } from '../componentTokens/footer.component.tokens';
import { curlVars } from '../componentTokens/pageCurl.component.tokens';

const fullSizeMinWidth = layoutVars.content.width.add(
  layoutVars.content.padding.multiply(2),
);

export const mediaQueryStyleConfig: IMediaQueries = {
  fullSize: {
    minWidth: fullSizeMinWidth,
  },

  noEdge: {
    maxWidth: fullSizeMinWidth.subtract(1),
  },

  noEdgeOnly: {
    minWidth: layoutVars.compact.maxWidth.subtract(1),
    maxWidth: fullSizeMinWidth.subtract(1),
  },

  snug: {
    maxWidth: layoutVars.snug.maxWidth,
  },

  snugOnly: {
    minWidth: layoutVars.compact.maxWidth.subtract(1),
    maxWidth: layoutVars.snug.maxWidth,
  },

  compact: {
    maxWidth: layoutVars.compact.maxWidth,
  },

  compactOnly: {
    minWidth: layoutVars.compressed.maxWidth.add(1),
    maxWidth: layoutVars.snug.maxWidth,
  },

  notCompact: {
    minWidth: layoutVars.compact.maxWidth.add(1),
  },

  compressed: {
    maxWidth: layoutVars.compressed.maxWidth,
  },
};

const baseMediaQueryStyle = mediaQueryFactory({
  queries: mediaQueryStyleConfig,
  config: {
    label: 'Global Media Queries',
    modules: defineMediaQueryModules('core'),
    preProcessor: preprocessorVanillaExtract,
    output: outputVanillaExtract,
  },
});
export const mediaQueryStyle = (
  styles: Parameters<typeof baseMediaQueryStyle>[0],
): Record<string, StyleRule> =>
  baseMediaQueryStyle(styles) as unknown as Record<string, StyleRule>;

export const globalMediaQueryStyle = (
  styles: Parameters<typeof baseMediaQueryStyle>[0],
): StyleRule => {
  const scopedStyles = baseMediaQueryStyle(
    styles,
  ) as unknown as Record<string, StyleRule>;
  return scopedStyles['&'] ?? {};
};

// Component specific media queries

const footerOneCol = curlVars.open.height
  .multiply(2)
  .add(footerVars.glassyLinks.size.multiply(3))
  .add(footerVars.glassyLinks.gap.multiply(4));

const componentSpecificQueriesConfig: IMediaQueries = {
  card_oneColumn: {
    maxWidth: cardLayout.oneColumn.maxWidth.add(200),
  },
  footer_oneColumn: {
    maxWidth: footerOneCol,
  },
  not_footer_oneColumn: {
    minWidth: footerOneCol.add(1),
  },
  contact_noEdge: {
    maxWidth: formLayoutVars.maxWidth,
  },
  contact_compact: {
    maxWidth: formLayoutVars.compact.maxWidth,
  },
  bricks_twoColumn: {
    maxWidth: bricksLayout.breakpoints.twoColumn,
  },
  bricks_oneColumn: {
    maxWidth: bricksLayout.breakpoints.oneColumn,
  },
};

const baseComponentMediaQueries = mediaQueryFactory({
  queries: componentSpecificQueriesConfig,
  config: {
    label: 'Component Specific Queries',
    modules: defineMediaQueryModules('core'),
    preProcessor: preprocessorVanillaExtract,
    output: outputVanillaExtract,
  },
});

export const componentMediaQueries = (
  styles: Parameters<typeof baseComponentMediaQueries>[0],
): Record<string, StyleRule> =>
  baseComponentMediaQueries(styles) as unknown as Record<
    string,
    StyleRule
  >;

export const globalComponentMediaQueryStyle = (
  styles: Parameters<typeof baseComponentMediaQueries>[0],
): StyleRule => {
  const scopedStyles = baseComponentMediaQueries(
    styles,
  ) as unknown as Record<string, StyleRule>;
  return scopedStyles['&'] ?? {};
};
