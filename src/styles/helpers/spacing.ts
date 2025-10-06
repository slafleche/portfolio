import { toCssMeasurement } from './style';
import { MeasurementLike } from './measurement';

type SpacingValue = MeasurementLike | number | null | undefined;

export interface SpacingProps {
	all?: SpacingValue;
	horizontal?: SpacingValue;
	vertical?: SpacingValue;
	top?: SpacingValue;
	right?: SpacingValue;
	bottom?: SpacingValue;
	left?: SpacingValue;
}

const resolve = (value: SpacingValue, fallback: string): string =>
	toCssMeasurement(value) ?? fallback;

const spacing = (props?: SpacingProps): string => {
	const base = resolve(props?.all, '0');
	const verticalBase =
		props?.vertical !== undefined ? resolve(props.vertical, base) : base;
	const horizontalBase =
		props?.horizontal !== undefined ? resolve(props.horizontal, base) : base;

	const topSpacing = resolve(props?.top, verticalBase);
	const rightSpacing = resolve(props?.right, horizontalBase);
	const bottomSpacing = resolve(props?.bottom, verticalBase);
	const leftSpacing = resolve(props?.left, horizontalBase);

	const allEqual =
		topSpacing === rightSpacing &&
		rightSpacing === bottomSpacing &&
		bottomSpacing === leftSpacing;

	if (allEqual) return topSpacing;

	const verticalSymmetry = topSpacing === bottomSpacing;
	const horizontalSymmetry = leftSpacing === rightSpacing;

	if (verticalSymmetry && horizontalSymmetry) {
		return `${topSpacing} ${rightSpacing}`;
	}

	if (horizontalSymmetry) {
		return `${topSpacing} ${rightSpacing} ${bottomSpacing}`;
	}

	return `${topSpacing} ${rightSpacing} ${bottomSpacing} ${leftSpacing}`;
};

export const paddings = (props?: SpacingProps) => ({
	padding: spacing(props),
});

export const margins = (props?: SpacingProps) => ({
	margin: spacing(props),
});
