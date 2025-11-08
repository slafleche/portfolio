import type * as CSSCore from 'csstype';
export * as CSS_TYPES from 'csstype';
import type { IMeasurement } from '../measurementKit';
import type { Color } from './colorWrap.helper';

// Many tokens in .ts are objects (e.g., chroma colors, measurement objects)
// that expose a `.css()` method to produce a CSS string on demand.
export type CssLike = {
  css: () => string;
};

export type Axis = 'top' | 'right' | 'bottom' | 'left';

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

export type FontFamilyDef = {
  family: CSSCore.Property.FontFamily;
  weights: {
    low: number;
    high: number;
    default: number;
    strong: number;
  };
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
 * - Texts: optional literal strings to include (useful for hard-coded
 *   bits)
 * - Keys: translation keys to resolve from locales (scanned across ALL
 *   locales)
 * - Weights: string | string[] (e.g., "400", ["400","700"], "100..900")
 * - Ital: request italics set in addition to roman
 * - Subsets: override default ["latin"] if needed (e.g., ["latin-ext"])
 */
export type FontConfig = {
  texts?: string[];
  keys?: string[];
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
