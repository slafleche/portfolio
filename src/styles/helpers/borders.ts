import * as CSS from 'csstype';
import {
	borderVars,
	colorVars,
	IBorder,
	BorderMeasurementInput,
	BorderRadiusConfig,
	BorderRadiusInput,
	BorderWidthConfig,
	BorderWidthInput,
} from '../vars';
import { toCssMeasurement, toCssColor, hasCss } from './style';

// Final export needs to be css properties, not objects
// Only plain CSS values should leave this helper so `style()` receives
// serializable strings. We intentionally normalize objects at the boundary.
interface IFinalBorder {
	borderColor?: CSS.Property.BorderColor;
	borderWidth?: CSS.Property.BorderWidth;
	borderStyle?: CSS.Property.BorderStyle;
	borderRadius?: CSS.Property.BorderRadius;
}

// Accept object tokens (IMeasurement, chroma Color, etc.) but return only
// plain CSS strings so the result can be safely spread into `style()`.
const fallbackMeasurement = (
	value: BorderMeasurementInput,
	fallback: string,
) => toCssMeasurement(value) ?? fallback;

const compressSides = (
	top: string,
	right: string,
	bottom: string,
	left: string,
) => {
	const allEqual = top === right && right === bottom && bottom === left;
	if (allEqual) return top;

	const verticalMatch = top === bottom;
	const horizontalMatch = right === left;

	if (verticalMatch && horizontalMatch) {
		return `${top} ${right}`;
	}

	if (horizontalMatch) {
		return `${top} ${right} ${bottom}`;
	}

	return `${top} ${right} ${bottom} ${left}`;
};

const hasNumericValue = (value: unknown): value is { value: number } =>
	typeof value === 'object' &&
	value !== null &&
	'value' in (value as Record<string, unknown>) &&
	typeof (value as { value?: unknown }).value === 'number';

const isWidthConfig = (value: unknown): value is BorderWidthConfig =>
	typeof value === 'object' &&
	value !== null &&
	!Array.isArray(value) &&
	!hasCss(value) &&
	!hasNumericValue(value) &&
	('all' in (value as BorderWidthConfig) ||
		'horizontal' in (value as BorderWidthConfig) ||
		'vertical' in (value as BorderWidthConfig) ||
		'top' in (value as BorderWidthConfig) ||
		'right' in (value as BorderWidthConfig) ||
		'bottom' in (value as BorderWidthConfig) ||
		'left' in (value as BorderWidthConfig));

const isRadiusConfig = (value: unknown): value is BorderRadiusConfig =>
	typeof value === 'object' &&
	value !== null &&
	!Array.isArray(value) &&
	!hasCss(value) &&
	!hasNumericValue(value) &&
	('all' in (value as BorderRadiusConfig) ||
		'topLeft' in (value as BorderRadiusConfig) ||
		'topRight' in (value as BorderRadiusConfig) ||
		'bottomRight' in (value as BorderRadiusConfig) ||
		'bottomLeft' in (value as BorderRadiusConfig));

const resolveWidth = (width?: BorderWidthInput): string | undefined => {
	const defaultWidth = toCssMeasurement(borderVars.width) ?? '0';
	if (width === undefined) return defaultWidth;

	if (isWidthConfig(width)) {
		const base = fallbackMeasurement(width.all, defaultWidth);
		const vertical = fallbackMeasurement(width.vertical, base);
		const horizontal = fallbackMeasurement(width.horizontal, base);

		const top = fallbackMeasurement(width.top, vertical);
		const right = fallbackMeasurement(width.right, horizontal);
		const bottom = fallbackMeasurement(width.bottom, vertical);
		const left = fallbackMeasurement(width.left, horizontal);

		return compressSides(top, right, bottom, left);
	}

	const direct = toCssMeasurement(width);
	return direct ?? defaultWidth;
};

const resolveRadius = (radius?: BorderRadiusInput): string | undefined => {
	const defaultRadius = toCssMeasurement(borderVars.radius) ?? '0';
	if (radius === undefined || radius === null) return undefined;

	if (Array.isArray(radius)) {
		const values = radius
			.map((entry) => toCssMeasurement(entry))
			.filter((entry): entry is string => Boolean(entry));
		return values.length > 0 ? values.join(' ') : defaultRadius;
	}

	if (isRadiusConfig(radius)) {
		const base = fallbackMeasurement(radius.all, defaultRadius);
		const topLeft = fallbackMeasurement(radius.topLeft, base);
		const topRight = fallbackMeasurement(radius.topRight, base);
		const bottomRight = fallbackMeasurement(radius.bottomRight, base);
		const bottomLeft = fallbackMeasurement(radius.bottomLeft, base);

		return compressSides(topLeft, topRight, bottomRight, bottomLeft);
	}

	const direct = toCssMeasurement(radius);
	return direct ?? defaultRadius;
};

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
		const widthVal = resolveWidth(width);
		if (widthVal) finalBorder.borderWidth = widthVal;

		const radiusVal = resolveRadius(radius);
		if (radiusVal && radiusVal !== '0' && radiusVal !== '0px') {
			finalBorder.borderRadius = radiusVal;
		}

		finalBorder.borderColor = toCssColor(color ?? colorVars.border);
		return finalBorder;
	}

	return { border: 'none' };
};

export default borders;
