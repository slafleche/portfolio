import type * as CSS from 'csstype';

type FontFamilyWeights = {
	weights: {
		low: number;
		high: number;
	};
};

const normalizeWeight = (weightPercentage: number) => {
	if (weightPercentage < 0 || weightPercentage > 100) {
		throw new Error(`Bad value for font weight: ${weightPercentage}`);
	}

	return weightPercentage / 100;
};

export const computeFontWeight = (
	fontData: FontFamilyWeights,
	weightPercentage: number,
): CSS.Property.FontWeight => {
	const { high, low } = fontData.weights;
	const normalized = normalizeWeight(weightPercentage);
	const value = low + (high - low) * normalized;
	return value as CSS.Property.FontWeight;
};

type FontWeightStyle = Pick<CSS.Properties, 'fontWeight'>;

export const fontWeightStyle = (
	fontData: FontFamilyWeights,
	weightPercentage: number,
): FontWeightStyle => ({
	fontWeight: computeFontWeight(fontData, weightPercentage),
});
