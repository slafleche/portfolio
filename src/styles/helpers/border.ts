import * as CSS from 'csstype';

import { borderVars, colorVars, IBorder } from '../vars';
import { CssLike } from '../utilities.css';
import { MeasurementLike } from './measurement';

// Final export needs to be css properties, not objects
// Only plain CSS values should leave this helper so `style()` receives
// serializable strings. We intentionally normalize objects at the boundary.
interface IFinalBorder {
  borderColor?: CSS.Property.BorderColor;
  borderWidth?: CSS.Property.BorderWidth;
  borderStyle?: CSS.Property.BorderStyle;
  borderRadius?: CSS.Property.BorderRadius;
}

// Type guard: narrows values that expose a `.css()` method without relying on `any`.
const hasCss = (v: unknown): v is CssLike =>
  typeof v === 'object' && v !== null && 'css' in (v as Record<string, unknown>) &&
  typeof (v as Record<string, unknown>).css === 'function';

// Normalize measurement-like values to a CSS string (e.g., "10px").
// - If it's a string, pass through.
// - If it has `.css()`, use it (measurement tokens).
// - If it looks like `{ value, unit }`, format as `${value}${unit ?? 'px'}`.
// We keep the param as a union/unknown-like to accept mixed tokens and
// centralize the conversion here rather than at every call site.
const toCssMeasurement = (m: MeasurementLike): string | undefined => {
  if (m === undefined) return undefined;
  if (typeof m === 'string') return m;
  if (hasCss(m)) return m.css();
  if (typeof m === 'object' && m !== null && 'value' in m) {
    const val = (m as { value: number }).value;
    const unit = (m as { unit?: string }).unit ?? 'px';
    return `${val}${unit}`;
  }
  return undefined;
};

// Normalize color-like tokens (string or chroma Color) to a CSS string.
const toCssColor = (c: unknown): CSS.Property.BorderColor => {
  if (typeof c === 'string') return c;
  if (hasCss(c)) return c.css();
  return String(c);
};

// Accept object tokens (IMeasurement, chroma Color, etc.) but return only
// plain CSS strings so the result can be safely spread into `style()`.
const borders = (props: IBorder = {}) => {
  const {
    color, // can be CSS string or chroma Color (via defaults in vars)
    width, // IMeasurement-like
    style = borderVars.style, // string
    radius, // IMeasurement-like
  } = props;

  // If border-style: "none"; bypass the rest
  const finalBorder: IFinalBorder = { borderStyle: style };

  if (style !== 'none') {
    const widthVal = toCssMeasurement(width ?? borderVars.width);
    if (widthVal) finalBorder.borderWidth = widthVal;

    if (radius) {
      const r = toCssMeasurement(radius);
      if (r && r !== '0' && r !== '0px') finalBorder.borderRadius = r;
    }

    finalBorder.borderColor = toCssColor(color ?? colorVars.border);
    return finalBorder;
  }

  return { border: 'none' };
};

export default borders;
