import {
  defineMediaQueryModules,
  mediaQueryFactory,
  preprocessorVanillaExtract,
  outputVanillaExtract,
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

// Component specific media queries

const componentSpecificQueriesConfig: IMediaQueries = {
  hero_compact: {
    maxWidth: heroVars.queries.compact,
  },
  card_oneColumn: {
    maxWidth: cardLayout.oneColumn.maxWidth,
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
