import type {
  AxisValues,
  CompassCorners,
  CompassRegion,
  CornerPosition,
  CSS_TYPES,
} from '@/styles/helpers/types.helper';
import type {
  IBorder,
  BorderWidthInput,
  BorderRadiusInput,
} from '@/tokens/global.tokens';

export type BorderLike = IBorder | Readonly<IBorder>;

export type EdgeSpec = boolean | BorderLike;
export type RadiusSpec = CompassCorners<BorderRadiusInput>;

export interface BorderIntent extends AxisValues<EdgeSpec> {
  radius?: RadiusSpec | 0 | null;
}

export interface FinalBorderCSS {
  borderColor?: CSS_TYPES.Property.BorderColor;
  borderStyle?: CSS_TYPES.Property.BorderStyle;
  borderWidth?: CSS_TYPES.Property.BorderWidth;
  borderRadius?: CSS_TYPES.Property.BorderRadius;

  borderTopColor?: CSS_TYPES.Property.BorderTopColor;
  borderRightColor?: CSS_TYPES.Property.BorderRightColor;
  borderBottomColor?: CSS_TYPES.Property.BorderBottomColor;
  borderLeftColor?: CSS_TYPES.Property.BorderLeftColor;

  borderTopStyle?: CSS_TYPES.Property.BorderTopStyle;
  borderRightStyle?: CSS_TYPES.Property.BorderRightStyle;
  borderBottomStyle?: CSS_TYPES.Property.BorderBottomStyle;
  borderLeftStyle?: CSS_TYPES.Property.BorderLeftStyle;

  borderTopWidth?: CSS_TYPES.Property.BorderTopWidth;
  borderRightWidth?: CSS_TYPES.Property.BorderRightWidth;
  borderBottomWidth?: CSS_TYPES.Property.BorderBottomWidth;
  borderLeftWidth?: CSS_TYPES.Property.BorderLeftWidth;

  border?: 'none';
}

export type BorderDefaults = {
  width: CSS_TYPES.Property.BorderWidth;
  style: CSS_TYPES.Property.BorderStyle;
  color: CSS_TYPES.Property.BorderColor;
  radius: CSS_TYPES.Property.BorderRadius;
};

export type EdgeState = {
  active: boolean;
  width?: string;
  style?: CSS_TYPES.Property.BorderStyle;
  color?: string;
  _wExp?: boolean;
  _sExp?: boolean;
  _cExp?: boolean;
};

export type BorderOptions = {
  allowRadiusOnly?: boolean;
};

export const edgeKeys: Array<Exclude<keyof BorderIntent, 'radius'>> = [
  'all',
  'vertical',
  'horizontal',
  'top',
  'right',
  'bottom',
  'left',
];

export type BorderShortcut = Partial<BorderLike> & {
  radius?:
    | BorderRadiusInput
    | Partial<
        Record<
          'all' | CompassRegion | CornerPosition,
          BorderRadiusInput
        >
      >;
};

export type BorderInput =
  | BorderIntent
  | BorderRadiusInput
  | BorderShortcut
  | BorderLike;

export type Corner = 'tl' | 'tr' | 'br' | 'bl';

