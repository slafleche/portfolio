import type { CssLike } from './types';

export interface IMeasurement {
	value: number;
	unit?: string;
	css: () => string;
	getUnit: () => string;
	isUnit: (unit: string) => boolean;
assertUnit: (unit: string, context?: string) => void;
	assert: (predicate: (measurement: IMeasurement) => boolean, message: string) => void;
	toPercentDecimal: () => number;
	add: (
		delta:
			| number
			| IMeasurement
			| string
			| {
					value: number;
					unit?: string;
			  },
	) => IMeasurement;
	subtract: (
		delta:
			| number
			| IMeasurement
			| string
			| {
					value: number;
					unit?: string;
			  },
	) => IMeasurement;
	multiply: (factor: number) => IMeasurement;
	divide: (divisor: number) => IMeasurement;
	double: () => IMeasurement;
	half: () => IMeasurement;
	negation: (shouldNegate?: boolean) => IMeasurement;
	absolute: () => IMeasurement;
}

const assertMatchingUnits = (
	left: IMeasurement,
	right: IMeasurement,
) => {
	const leftUnit = left.unit ?? 'px';
	const rightUnit = right.unit ?? 'px';
	if (leftUnit !== rightUnit) {
		throw new Error(
			`measurement unit mismatch: ${leftUnit} vs ${rightUnit}`,
		);
	}
	return leftUnit;
};

export const parseStringMeasurement = (
	cssValue: string,
): IMeasurement => {
	let value = cssValue.trim();
	const unit = value.replace(/^-?(0|[1-9]\d*)?([.][0-9]*)?/, '');
	value = value.substring(0, value.length - unit.length);
	if (value === '-0') value = '0';
	const finalValue = Number(value);
	const finalUnit = unit.trim() || 'px';
	return m(finalValue, finalUnit);
};

type DeltaInput =
	| number
	| IMeasurement
	| string
	| {
			value: number;
			unit?: string;
	  };

const coerceDelta = (
	base: IMeasurement,
	delta: DeltaInput,
): { amount: number; unit: string } => {
	const baseUnit = base.unit ?? 'px';

	if (typeof delta === 'number') {
		return {
			amount: delta,
			unit: baseUnit,
		};
	}

	if (typeof (delta as IMeasurement)?.css === 'function') {
		const other = delta as IMeasurement;
		const unit = assertMatchingUnits(base, other);
		return {
			amount: other.value,
			unit,
		};
	}

	if (typeof delta === 'string') {
		const parsed = parseStringMeasurement(delta);
		const unit = assertMatchingUnits(base, parsed);
		return {
			amount: parsed.value,
			unit,
		};
	}

	if (delta && typeof delta === 'object' && 'value' in delta) {
		const unit = delta.unit ?? baseUnit;
		const temp = m(delta.value, unit);
		assertMatchingUnits(base, temp);
		return {
			amount: delta.value,
			unit,
		};
	}

	throw new Error('Unsupported delta type for measurement operation');
};

const createMeasurement = (
	value: number,
	unit: string,
): IMeasurement => {
	const measurement: IMeasurement = {
		value,
		unit,
		css: () => `${value}${unit}`,
		getUnit: () => unit,
	isUnit: (expected: string) =>
		unit.toLowerCase() === expected.toLowerCase(),
	assertUnit: (expected: string, context?: string) => {
		if (!measurement.isUnit(expected)) {
			const location = context ? `${context}: ` : '';
			throw new Error(
				`${location}Expected unit "${expected}", received "${unit}".`,
			);
		}
	},
	assert: (
		predicate: (measurement: IMeasurement) => boolean,
		message: string,
	) => {
		if (!predicate(measurement)) {
			throw new Error(message);
		}
	},
	toPercentDecimal: () => {
		if (!measurement.isUnit('%')) {
			throw new Error(
				`Cannot convert measurement with unit "${unit}" to percent decimal.`,
			);
		}
		return value / 100;
	},
		add: (delta) => {
			const { amount } = coerceDelta(measurement, delta);
			return createMeasurement(value + amount, unit);
		},
		subtract: (delta) => {
			const { amount } = coerceDelta(measurement, delta);
			return createMeasurement(value - amount, unit);
		},
		multiply: (factor) => createMeasurement(value * factor, unit),
		divide: (divisor) => createMeasurement(value / divisor, unit),
		double: () => createMeasurement(value * 2, unit),
		half: () => createMeasurement(value / 2, unit),
		negation: (shouldNegate = true) =>
			shouldNegate ? createMeasurement(-value, unit) : measurement,
		absolute: () => createMeasurement(Math.abs(value), unit),
	};
	return measurement;
};

export const m = (
	value: number,
	unit: string = 'px',
): IMeasurement => createMeasurement(value, unit);

export const mPercent = (value: number): IMeasurement =>
	createMeasurement(value, '%');

export const double = (measurement: IMeasurement) =>
	measurement.double();
export const half = (measurement: IMeasurement) => measurement.half();
export const negation = (measurement: IMeasurement, shouldNegate = true) =>
	measurement.negation(shouldNegate);

export const measurementMin = (a: IMeasurement, b: IMeasurement) => {
	const unit = assertMatchingUnits(a, b);
	const winner = a.value <= b.value ? a : b;
	return a === winner ? a : m(winner.value, unit);
};

export const measurementMax = (a: IMeasurement, b: IMeasurement) => {
	const unit = assertMatchingUnits(a, b);
	const winner = a.value >= b.value ? a : b;
	return a === winner ? a : m(winner.value, unit);
};

export function isCssLike(x: unknown): x is CssLike {
	return (
		typeof x === 'object' &&
		x !== null &&
		'css' in x &&
		typeof (x as { css: unknown }).css === 'function'
	);
}
