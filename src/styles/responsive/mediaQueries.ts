import {
  defineMediaQueryModules,
  mediaQueryFactory,
  mediaQueryOutputVanillaExtract,
  type IMediaQueries,
  type IMediaQueryProps,
} from 'css-calipers/mediaQueries';
import { layoutVars } from '../../tokens/layout.tokens';

const fullSize = layoutVars.contentWidth.add(
  layoutVars.contentPadding.double(),
);

export const globalMediaQueriesConf: IMediaQueries = {
  fullSize: {
    minWidth: fullSize,
  } as IMediaQueryProps,

  noBleed: {
    maxWidth: fullSize.subtract(1),
  } as IMediaQueryProps,

  // compact: {
  //   maxWidth: layoutVars.compact.contentWidth.css(),
  //   minWidth: layoutVars.compressed.contentWidth.add(1).css(),
  // } as IMediaQueryProps,

  // compressed: {
  //   maxWidth: layoutVars.compressed.contentWidth.css(),
  // } as IMediaQueryProps,
};
const coreModules = defineMediaQueryModules('core');

export const mediaQueryStyle = mediaQueryFactory({
  queries: globalMediaQueriesConf,
  config: {
    label: 'Global Media Queries',
    modules: coreModules,
    output: mediaQueryOutputVanillaExtract,
  },
});

export const globalMediaQueries = globalMediaQueriesConf;

export default globalMediaQueries;
