import type * as CSS from 'csstype';

import { type MeasurementLike, type CssLike } from './types';

// Guard for tokens that expose a `.css()` helper (IMeasurement, chroma color wrappers, etc.).
export const hasCss = (value: unknown): value is CssLike =>
	typeof value === 'object' &&
	value !== null &&
	'css' in (value as Record<string, unknown>) &&
	typeof (value as Record<string, unknown>).css === 'function';

// Normalize measurement-like inputs to CSS strings.
// Accepts strings, measurement tokens, `{ value, unit }`, and bare numbers.
export const toCssMeasurement = (
	value?: MeasurementLike | number | null,
): string | undefined => {
	if (value === undefined || value === null) return undefined;
	if (typeof value === 'string') return value;
	if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`;
	if (hasCss(value)) return value.css();
	if (typeof value === 'object' && 'value' in value) {
		const numeric = (value as { value: number }).value;
		const unit = (value as { unit?: string }).unit ?? 'px';
		return `${numeric}${unit}`;
	}
	return undefined;
};

// Normalize color-like values (strings, chroma tokens, etc.) into CSS strings.
export const toCssColor = (value: unknown): CSS.Property.Color => {
	if (typeof value === 'string') return value;
	if (hasCss(value)) return value.css();
	return String(value);
};
