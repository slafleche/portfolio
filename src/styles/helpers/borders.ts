import * as CSS from 'csstype';
import { borderVars, colorVars, IBorder } from '../vars';
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
