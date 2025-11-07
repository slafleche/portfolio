import type * as CSS from 'csstype';
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

export type FontFamilyDef = {
  family: CSS.Property.FontFamily;
  weights: {
    low: number;
    high: number;
    default: number;
    strong: number;
  };
  offsetToFlushTop: IMeasurement;
  spacing?: IMeasurement;
  lineHeight?: CSS.Property.LineHeight;
  css?: Partial<CSS.Properties>;
  axisDefaults?: Record<string, number | string>;
};

export type FontStyles = {
  familyDef?: FontFamilyDef | null;
  family?: CSS.Property.FontFamily;
  fontFamily?: CSS.Property.FontFamily;
  fontWeight?: CSS.Property.FontWeight;
  weight?: CSS.Property.FontWeight;
  size?:
    | CssLike
    | string
    | { value: number; unit?: string }
    | undefined;
  weights?: {
    default: CSS.Property.FontWeight;
    strong: CSS.Property.FontWeight;
  };
  lineHeight?: CSS.Property.LineHeight;
  spacing?:
    | CssLike
    | string
    | { value: number; unit?: string }
    | undefined;
  offsetToFlushTop?: IMeasurement;
  css?: Partial<CSS.Properties>;
  color?: CssLike | Color | CSS.Property.Color;
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
  keys?: string[]; // <— new
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

export type BorderMeasurementInput =
  | IMeasurement
  | null
  | undefined;

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
  | BorderMeasurementInput
  | BorderMeasurementInput[]
  | BorderRadiusConfig;

export interface IBorder {
  color?: CSS.Property.BorderColor | CssLike | Color;
  width?: BorderWidthInput;
  style?: CSS.Property.BorderStyle;
  radius?: BorderRadiusInput;
}
