import * as CSS from 'csstype';
import {
	borderVars,
	colorVars,
	IBorder,
	BorderMeasurementInput,
	BorderRadiusInput,
	BorderWidthInput,
} from '../vars';
import { toCssMeasurement, toCssColor } from './style';

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

const resolveWidth = (width?: BorderWidthInput): string | undefined => {
	const defaultWidth = toCssMeasurement(borderVars.width) ?? '0';
	if (width === undefined) return defaultWidth;

	const direct = toCssMeasurement(width as BorderMeasurementInput);
	if (direct) return direct;

	if (typeof width === 'object' && width !== null && !Array.isArray(width)) {
		const widthConfig = width as Extract<
			BorderWidthInput,
			Record<string, BorderMeasurementInput>
		>;
		const base = fallbackMeasurement(widthConfig.all, defaultWidth);
		const vertical = fallbackMeasurement(widthConfig.vertical, base);
		const horizontal = fallbackMeasurement(widthConfig.horizontal, base);

		const top = fallbackMeasurement(widthConfig.top, vertical);
		const right = fallbackMeasurement(widthConfig.right, horizontal);
		const bottom = fallbackMeasurement(widthConfig.bottom, vertical);
		const left = fallbackMeasurement(widthConfig.left, horizontal);

		return compressSides(top, right, bottom, left);
	}

	return defaultWidth;
};

const resolveRadius = (radius?: BorderRadiusInput): string | undefined => {
	const defaultRadius = toCssMeasurement(borderVars.radius) ?? '0';
	if (radius === undefined) return undefined;

	if (Array.isArray(radius)) {
		const values = radius
			.map((entry) => toCssMeasurement(entry))
			.filter((entry): entry is string => Boolean(entry));
		return values.length > 0 ? values.join(' ') : defaultRadius;
	}

	const direct = toCssMeasurement(radius as BorderMeasurementInput);
	if (direct) return direct;

	if (
		typeof radius === 'object' &&
		radius !== null &&
		!Array.isArray(radius)
	) {
		const radiusConfig = radius as Extract<
			BorderRadiusInput,
			Record<string, BorderMeasurementInput>
		>;
		const base = fallbackMeasurement(radiusConfig.all, defaultRadius);
		const topLeft = fallbackMeasurement(radiusConfig.topLeft, base);
		const topRight = fallbackMeasurement(radiusConfig.topRight, base);
		const bottomRight = fallbackMeasurement(radiusConfig.bottomRight, base);
		const bottomLeft = fallbackMeasurement(radiusConfig.bottomLeft, base);

		return compressSides(topLeft, topRight, bottomRight, bottomLeft);
	}

	return defaultRadius;
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
