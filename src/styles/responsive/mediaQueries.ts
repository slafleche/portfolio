import type {
  ComplexStyleRule,
  StyleRule,
} from '@vanilla-extract/css';
// import * as CSS from 'csstype';
// import { m, parseStringMeasurement } from '../measurementKit';
import { layoutVars } from '../componentTokens/layout.componentTokens';

export interface IMediaQueryProps {
  type?: 'all' | 'print' | 'screen';
  minWidth?: string;
  maxWidth?: string;
}

export interface IMediaQuery {
  props: IMediaQueryProps;
  styles: StyleRule;
}

export type IMediaQueries = IMediaQuery[];

// https://github.com/yocontra/react-responsive
// To be used in hooks with useMediaQuery()
// Example: const isFullSize = useMediaQuery(globalMediaQueries.fullSize);
const globalMediaQueries = {
  fullSize: {
    minWidth: layoutVars.contentWidth
      .add(layoutVars.contentPadding.double())
      .css(),
  } as IMediaQueryProps,

  // compact: {
  //   maxWidth: layoutVars.compact.contentWidth.css(),
  //   minWidth: layoutVars.compressed.contentWidth.add(1).css(),
  // } as IMediaQueryProps,

  // compressed: {
  //   maxWidth: layoutVars.compressed.contentWidth.css(),
  // } as IMediaQueryProps,
};

// Example use:
// const exampleStyles = {
//   label: style({
//     fontSize: "0.8em",
//     ...mediaQueryStyle({
//       props: mediaQueries.smallerText,
//       styles: {
//         fontSize: "0.5em",
//       },
//     }),
//   }),
// };
export const mediaQueryStyle = (
  queryAndStyles: IMediaQuery | IMediaQueries,
  debug = false,
) => {
  if (!Array.isArray(queryAndStyles)) {
    queryAndStyles = [
      queryAndStyles,
    ];
  }
  const result: Record<string, StyleRule> = {};
  queryAndStyles.forEach((mq) => {
    const { props, styles } = mq;
    const minWidth =
      'minWidth' in props
        ? ` and (min-width: ${props.minWidth})`
        : ``;

    const maxWidth =
      'maxWidth' in props
        ? ` and (max-width: ${props.maxWidth})`
        : ``;

    const rule = `${props.type ?? 'screen'}${minWidth}${maxWidth}`;
    result[rule] = styles;
  });
  const mediaQuery: ComplexStyleRule = {
    '@media': result,
  };
  if (debug) {
    console.log('mediaQuery: ', mediaQuery);
  }
  return mediaQuery;
};

interface IGlobalMediaQueryStyles {
  fullSize?: StyleRule;
  noBleed?: StyleRule;
  compact?: StyleRule;
  compressed?: StyleRule;
}

export const globalMediaQueryStyles = (
  styles: IGlobalMediaQueryStyles,
  debug = false,
) => {
  const mediaQueries: IMediaQuery[] = [];

  if (styles.fullSize) {
    mediaQueries.push({
      props: globalMediaQueries.fullSize,
      styles: styles.fullSize,
    });
  }

  // if (styles.compact) {
  //   mediaQueries.push({
  //     props: globalMediaQueries.compact,
  //     styles: styles.compact,
  //   });
  // }

  // if (styles.compressed) {
  //   mediaQueries.push({
  //     props: globalMediaQueries.compressed,
  //     styles: styles.compressed,
  //   });
  // }

  return mediaQueryStyle(mediaQueries, debug);
};

export default globalMediaQueries;
