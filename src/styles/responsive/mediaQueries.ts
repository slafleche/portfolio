import {
  defineMediaQueryModules,
  mediaQueryFactory,
  mediaQueryOutputVanillaExtract,
  type IMediaQueries,
  type IMediaQueryProps,
} from 'css-calipers/mediaQueries';
import type { StyleRule } from '@vanilla-extract/css';
import { layoutVars } from '../../tokens/layout.tokens';
import { cardLayout } from '../componentTokens/card.componentTokens';
import { heroVars } from '../componentTokens/hero.componentTokens';

const fullSizeMinWidth = layoutVars.contentWidth.add(
  layoutVars.contentPadding.multiply(2),
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

  compact: {
    maxWidth: layoutVars.compact.maxWidth,
  } as IMediaQueryProps,

  // compressed: {
  //   maxWidth: layoutVars.compressed.contentWidth.css(),
  // } as IMediaQueryProps,
};

export const mediaQueryStyle = mediaQueryFactory({
  queries: mediaQueryStyleConfig,
  config: {
    label: 'Global Media Queries',
    modules: defineMediaQueryModules('core'),
    output: (media) =>
      mediaQueryOutputVanillaExtract<{
        [selector: string]: StyleRule;
      }>(media),
  },
});

export default mediaQueryStyle;

// Component specific media queries

const componentSpecificQueriesConfig: IMediaQueries = {
  hero_compact: {
    maxWidth: heroVars.queries.compact,
  },
  card_oneColumn: {
    maxWidth: cardLayout.oneColumn.maxWidth,
  },
};

export const componentMediaQueries = mediaQueryFactory({
  queries: componentSpecificQueriesConfig,
  config: {
    label: 'Component Specific Queries',
    modules: defineMediaQueryModules('core'),
    output: (media) =>
      mediaQueryOutputVanillaExtract<{
        [selector: string]: StyleRule;
      }>(media),
  },
});
