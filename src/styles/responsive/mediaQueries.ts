import type {
  ComplexStyleRule,
  StyleRule,
} from '@vanilla-extract/css';
import type { IMeasurement } from 'css-calipers';
import { layoutVars } from '../../tokens/layout.tokens';

export interface IMediaQueryProps {
  type?: 'all' | 'print' | 'screen';
  minWidth?: IMeasurement;
  maxWidth?: IMeasurement;
  orientation?: 'landscape' | 'portrait';
  prefers?: IMediaQueryPrefers;
  resolution?: IMediaQueryResolution;
}

export interface IMediaQueryPrefers {
  colorScheme?: 'light' | 'dark';
  reducedMotion?: 'no-preference' | 'reduce';
  contrast?: 'no-preference' | 'more' | 'less';
}

export interface IMediaQueryResolution {
  min?: IMeasurement;
  max?: IMeasurement;
}

export interface IMediaQuery {
  props: IMediaQueryProps;
  styles: StyleRule;
}

export type IMediaQueries = Record<string, IMediaQueryProps>;

export type IMediaQueryStyles<T extends IMediaQueries> = Partial<
  Record<keyof T, StyleRule>
>;

const fullSize = layoutVars.contentWidth.add(
  layoutVars.contentPadding.double(),
);

export const globalMediaQueries: IMediaQueries = {
  fullSize: {
    minWidth: fullSize,
  } as IMediaQueryProps,

  noBleed: {
    minWidth: fullSize.subtract(1),
  } as IMediaQueryProps,

  // compact: {
  //   maxWidth: layoutVars.compact.contentWidth.css(),
  //   minWidth: layoutVars.compressed.contentWidth.add(1).css(),
  // } as IMediaQueryProps,

  // compressed: {
  //   maxWidth: layoutVars.compressed.contentWidth.css(),
  // } as IMediaQueryProps,
};

export const buildMediaQueryString = (
  props: IMediaQueryProps,
): string => {
  const mediaType = props.type ?? 'screen';
  const parts: string[] = [];

  if (props.minWidth) {
    parts.push(`(min-width: ${props.minWidth.css()})`);
  }
  if (props.maxWidth) {
    parts.push(`(max-width: ${props.maxWidth.css()})`);
  }
  if (props.orientation) {
    parts.push(`(orientation: ${props.orientation})`);
  }
  if (props.prefers?.colorScheme) {
    parts.push(
      `(prefers-color-scheme: ${props.prefers.colorScheme})`,
    );
  }
  if (props.prefers?.reducedMotion) {
    parts.push(
      `(prefers-reduced-motion: ${props.prefers.reducedMotion})`,
    );
  }
  if (props.prefers?.contrast) {
    parts.push(`(prefers-contrast: ${props.prefers.contrast})`);
  }
  if (props.resolution?.min) {
    parts.push(`(min-resolution: ${props.resolution.min.css()})`);
  }
  if (props.resolution?.max) {
    parts.push(`(max-resolution: ${props.resolution.max.css()})`);
  }

  return parts.length
    ? `${mediaType} and ${parts.join(' and ')}`
    : mediaType;
};

export const makeMediaQueryStyle = <T extends IMediaQueries>(
    queries: T,
  ) =>
  (
    stylesByQuery: IMediaQueryStyles<T>,
    debug = false,
  ): ComplexStyleRule => {
    const result: Record<string, StyleRule> = {};

    (Object.keys(stylesByQuery) as (keyof T)[]).forEach((key) => {
      const styles = stylesByQuery[key];
      const props = queries[key];
      if (!styles || !props) return;
      result[buildMediaQueryString(props)] = styles;
    });

    const mediaQuery: ComplexStyleRule = {
      '@media': result,
    };
    if (debug) {
      console.log('mediaQuery: ', mediaQuery);
    }
    return mediaQuery;
  };

export const mediaQueryStyle = makeMediaQueryStyle(
  globalMediaQueries,
);

export default globalMediaQueries;
