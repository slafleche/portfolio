import {
  defineMediaQueryModules,
  mediaQueryFactory,
  mediaQueryOutputVanillaExtract,
  type IMediaQueries,
  type IMediaQueryProps,
} from 'css-calipers/mediaQueries';
import { layoutVars } from '../../tokens/layout.tokens';
import { m } from 'css-calipers';

const fullSizeMinWidth = layoutVars.contentWidth.add(
  layoutVars.contentPadding.multiply(2),
);
const fullSizeMaxWidth = fullSizeMinWidth.subtract(1);
const noEdgeOnlyMinWidth = layoutVars.compact.contentWidth.add(1);

export const globalMediaQueries: IMediaQueries = {
  fullSize: {
    minWidth: fullSizeMinWidth,
  } as IMediaQueryProps,

  noEdge: {
    maxWidth: fullSizeMaxWidth,
  } as IMediaQueryProps,

  noEdgeOnly: {
    minWidth: noEdgeOnlyMinWidth,
    maxWidth: fullSizeMaxWidth,
  } as IMediaQueryProps,

  compact: {
    maxWidth: layoutVars.compact.contentWidth,
  } as IMediaQueryProps,

  // compressed: {
  //   maxWidth: layoutVars.compressed.contentWidth.css(),
  // } as IMediaQueryProps,
};

export const mediaQueryStyle = mediaQueryFactory({
  queries: globalMediaQueries,
  config: {
    label: 'Global Media Queries',
    modules: defineMediaQueryModules('core'),
    output: mediaQueryOutputVanillaExtract,
  },
});

export default globalMediaQueries;
