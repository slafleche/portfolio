import type { StyleRule } from '@vanilla-extract/css';
import {
  defineMediaQueryModules,
  type IMediaQueries,
  type IMediaQueryProps,
  mediaQueryFactory,
  outputVanillaExtract,
  preprocessorVanillaExtract,
} from 'css-calipers/mediaQueries';

import { layoutVars } from '../../tokens/layout.tokens';
import { cardLayout } from '../componentTokens/card.component.tokens';
import { footerVars } from '../componentTokens/footer.component.tokens';
import { curlVars } from '../componentTokens/pageCurl.component.tokens';

const fullSizeMinWidth = layoutVars.content.width.add(
  layoutVars.content.padding.multiply(2),
);

export const mediaQueryStyleConfig: IMediaQueries = {
  fullSize: {
    minWidth: fullSizeMinWidth,
  } as IMediaQueryProps,

  noEdge: {
    maxWidth: fullSizeMinWidth.subtract(1),
  } as IMediaQueryProps,

  noEdgeOnly: {
    minWidth: layoutVars.compact.maxWidth.subtract(1),
    maxWidth: fullSizeMinWidth.subtract(1),
  } as IMediaQueryProps,

  snug: {
    maxWidth: layoutVars.snug.maxWidth,
  } as IMediaQueryProps,

  snugOnly: {
    minWidth: layoutVars.compact.maxWidth.subtract(1),
    maxWidth: layoutVars.snug.maxWidth,
  } as IMediaQueryProps,

  compact: {
    maxWidth: layoutVars.compact.maxWidth,
  } as IMediaQueryProps,

  notCompact: {
    minWidth: layoutVars.compact.maxWidth.add(1),
  } as IMediaQueryProps,
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
  const scopedStyles = baseMediaQueryStyle(styles) as unknown as Record<
    string,
    StyleRule
  >;
  return scopedStyles['&'] ?? {};
};

// Component specific media queries

const footerOneCol = curlVars.open.height
      .multiply(2)
      .add(footerVars.glassyLinks.size.multiply(3))
      .add(footerVars.glassyLinks.gap.multiply(4));

const componentSpecificQueriesConfig: IMediaQueries = {
  hero_compact: {},
  card_oneColumn: {
    maxWidth: cardLayout.oneColumn.maxWidth,
  },
  footer_oneColumn: {
    maxWidth: footerOneCol,
  },
  not_footer_oneColumn: {
    minWidth: footerOneCol.add(1),
  }
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
  const scopedStyles = baseComponentMediaQueries(styles) as unknown as Record<
    string,
    StyleRule
  >;
  return scopedStyles['&'] ?? {};
};
