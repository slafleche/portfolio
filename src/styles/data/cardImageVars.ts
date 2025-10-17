import { dropShadowVars } from '../vars';
import { m, mPercent } from '../helpers/measurement';
import { colorVars } from '../vars';

export const cardImageVars = {
	borders: {
		width: m(6),
		color: colorVars.bodyFg,
	},
	shadows: {
		inner: {
			offsetX: dropShadowVars.offsetX,
			offsetY: dropShadowVars.offsetY,
			blur: dropShadowVars.blur,
			color: dropShadowVars.color,
		},
		outer: {
			offsetX: dropShadowVars.offsetX,
			offsetY: dropShadowVars.offsetY,
			blur: dropShadowVars.blur,
			color: dropShadowVars.color,
		},
	},
	image: {
		scale: 1.1,
		positionX: mPercent(70),
		positionY: mPercent(70),
	},
} as const;
