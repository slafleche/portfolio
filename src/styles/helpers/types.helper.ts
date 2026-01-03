import type * as CSSCore from 'csstype';
export * as CSS_TYPES from 'csstype';
import type { IMeasurement } from 'css-calipers';
import type { Color } from './colorWrap.helper';
import type { CSSPropertiesWithVars } from 'css-calipers/mediaQueries';

// Many tokens in .ts are objects (e.g., chroma colors, measurement objects)
// that expose a `.css()` method to produce a CSS string on demand.
export type CssLike = {
  css: () => string;
};

export type Axis = 'top' | 'right' | 'bottom' | 'left';

/**
 * AxisValues:
 *
 * - `all`: apply the same value to all four sides.
 * - `vertical`: apply the same value to `top` and `bottom`.
 * - `horizontal`: apply the same value to `left` and `right`.
 *
 * Shorthands are preferred when they accurately describe the intent:
 *
 * - If all four sides are equal, use `all`.
 * - If top/bottom match but left/right differ, use `vertical` plus
 *   explicit `left`/`right` overrides.
 * - If left/right match but top/bottom differ, use `horizontal` plus
 *   explicit `top`/`bottom` overrides.
 */
export type AxisValues<T> = {
  all?: T;
  horizontal?: T;
  vertical?: T;
} & Partial<Record<Axis, T>>;

export type CompassRegion = 'north' | 'south' | 'east' | 'west';
export type CornerPosition = 'nw' | 'ne' | 'se' | 'sw';

export type CompassCorners<T> = Partial<
  Record<'all' | CompassRegion | CornerPosition, T>
>;

export type SpacingKeyword =
  | 'auto'
  | 'inherit'
  | 'initial'
  | 'unset'
  | 'revert'
  | 'revert-layer';

export type SpacingValue = IMeasurement | SpacingKeyword;

// Four-side spacing shape (no axis shorthands).
export type SpacingBasics = Record<Axis, SpacingValue>;

export type FontFamilyDef = {
  family: CSSCore.Property.FontFamily;
  weights: {
    low: number;
    high: number;
    default: number;
    strong: number;
  };
  textAlign?: CSSCore.Property.TextAlign;
  textTransform?: CSSCore.Property.TextTransform;
  offsetToFlushTop: IMeasurement;
  spacing?: IMeasurement;
  lineHeight?: CSSCore.Property.LineHeight;
  css?: Partial<CSSCore.Properties>;
  axisDefaults?: Record<string, number | string>;
};

export type FontStyles = {
  familyDef?: FontFamilyDef | null;
  family?: CSSCore.Property.FontFamily;
  fontFamily?: CSSCore.Property.FontFamily;
  fontWeight?: CSSCore.Property.FontWeight;
  weight?: CSSCore.Property.FontWeight;
  textAlign?: CSSCore.Property.TextAlign;
  textTransform?: CSSCore.Property.TextTransform;
  size?:
    | CssLike
    | string
    | { value: number; unit?: string }
    | undefined;
  weights?: {
    default: CSSCore.Property.FontWeight;
    strong: CSSCore.Property.FontWeight;
  };
  lineHeight?: CSSCore.Property.LineHeight;
  spacing?:
    | CssLike
    | string
    | { value: number; unit?: string }
    | undefined;
  offsetToFlushTop?: IMeasurement;
  css?: Partial<CSSCore.Properties>;
  color?: CssLike | Color | CSSCore.Property.Color;
  waitForFonts?: string[];
  waitForFontsTimeoutMs?: number;
};

/**
 * Font family -> config object:
 *
 * - Weights: string | string[] (e.g., "400", ["400","700"], "100..900")
 * - Ital: request italics set in addition to roman
 * - Subsets: override default ["latin"] if needed (e.g., ["latin-ext"])
 */
export type FontConfig = {
  weights: string | string[];
  ital?: boolean;
  subsets?: string[];
  axes?: Record<string, string | string[]>;
  rawAxis?: string;
};

export type PageParams = {
  LOCALE: string;
};

export type NonEmptyString = string & { __brand: 'NonEmptyString' };

export type BorderMeasurementInput = IMeasurement | null | undefined;

export interface BorderWidthConfig {
  all?: BorderMeasurementInput;
  horizontal?: BorderMeasurementInput;
  vertical?: BorderMeasurementInput;
  top?: BorderMeasurementInput;
  right?: BorderMeasurementInput;
  bottom?: BorderMeasurementInput;
  left?: BorderMeasurementInput;
}

export type BorderWidthInput =
  | BorderMeasurementInput
  | BorderWidthConfig;

export interface BorderRadiusConfig {
  all?: BorderMeasurementInput;
  topLeft?: BorderMeasurementInput;
  topRight?: BorderMeasurementInput;
  bottomRight?: BorderMeasurementInput;
  bottomLeft?: BorderMeasurementInput;
}

export type BorderRadiusInput =
  | IMeasurement
  | ReadonlyArray<IMeasurement>
  | BorderRadiusConfig
  | null
  | undefined;

export interface IBorder {
  color?: CSSCore.Property.BorderColor | CssLike | Color;
  width?: BorderWidthInput;
  style?: CSSCore.Property.BorderStyle;
  radius?: BorderRadiusInput;
}
