import type { CssLike } from './types';

const isDev =
	typeof process !== 'undefined' &&
	process?.env?.NODE_ENV !== 'production';
const enableDebug = isDev;

type DebugEntry = {
	id: string;
	op: string;
	value: number;
	unit: string;
	count?: number;
	measurementId: string;
};
export type MeasurementDebugEntry = DebugEntry;

export type DebugOperationSnapshot = {
	op: string;
	value: number;
	unit: string;
	count: number;
};
export type MeasurementDebugGroups = Record<
	string,
	DebugOperationSnapshot[]
>;

type DebugState = {
	enabled: boolean;
	label?: string;
	autoLabel?: string;
	measurementId: string;
};

type MeasurementDebugStore = {
	store: MeasurementDebugEntry[];
	index: Map<string, number>;
};

const getGlobalDebugStore = (): MeasurementDebugStore => {
	const root = globalThis as {
		__MEASUREMENT_DEBUG__?: MeasurementDebugEntry[];
		__MEASUREMENT_DEBUG_INDEX__?: Map<string, number>;
	};
	if (!root.__MEASUREMENT_DEBUG__) {
		root.__MEASUREMENT_DEBUG__ = [];
	}
	if (!root.__MEASUREMENT_DEBUG_INDEX__) {
		root.__MEASUREMENT_DEBUG_INDEX__ = new Map();
	}
	return {
		store: root.__MEASUREMENT_DEBUG__,
		index: root.__MEASUREMENT_DEBUG_INDEX__!,
	};
};

const recordDebugEntry = (entry: MeasurementDebugEntry) => {
	const { store, index } = getGlobalDebugStore();
	const key = `${entry.measurementId}:${entry.op}`;
	const prevIndex = index.get(key);
	if (prevIndex != null) {
		const existing = store[prevIndex];
		store[prevIndex] = {
			...existing,
			value: entry.value,
			unit: entry.unit,
			count: (existing.count ?? 1) + 1,
		};
		return;
	}
	index.set(key, store.length);
	store.push({
		...entry,
		count: entry.count ?? 1,
	});
};

export interface IMeasurement {
	value: number;
	unit?: string;
	css: () => string;

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
	debugChain: (debugId: string) => IMeasurement;
	debug: (debugId: string) => IMeasurement;
}

// ----------------------
// Debug infra
// ----------------------

const measurementIds = new WeakMap<IMeasurement, string>();
let measurementIdCounter = 0;

const logDebug = (
	state: DebugState | undefined,
	operation: string,
	value: number,
	unit: string,
) => {
	if (!enableDebug || !state?.enabled) return;
	// You can extend this to push to a collector or console.log if needed
	if (typeof console !== 'undefined') {
		console.debug(
			`[m:${state.measurementId}] ${operation} → ${value}${unit}`,
		);
	}
	recordDebugEntry({
		id: `${state.measurementId}:${operation}`,
		op: operation,
		value,
		unit,
		measurementId: state.measurementId,
	});
};

// ----------------------
// Unit & coercion helpers
// ----------------------

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

const coerceDelta = (
	base: IMeasurement,
	delta:
		| number
		| IMeasurement
		| string
		| { value: number; unit?: string },
): { amount: number; unit: string } => {
	const baseUnit = base.unit ?? 'px';

	if (typeof delta === 'number')
		return {
			amount: delta,
			unit: baseUnit,
		};

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

// ----------------------
// Factory
// ----------------------

export const m = (
	value: number,
	unit: string = 'px',
): IMeasurement => {
	const measurementId = `m-${measurementIdCounter++}`;

	const create = (
		nextValue: number,
		debug?: DebugState,
	): IMeasurement => {
		const state =
			debug ??
			({
				enabled: false,
				measurementId,
			} as DebugState);

		const measurement: IMeasurement = {
			value: nextValue,
			unit,
			css: () => {
				logDebug(state, 'css', nextValue, unit);
				return `${nextValue}${unit}`;
			},

			add: (delta) => {
				const { amount } = coerceDelta(measurement, delta);
				const result = nextValue + amount;
				logDebug(state, `add(${amount})`, result, unit);
				return create(result, state);
			},

			subtract: (delta) => {
				const { amount } = coerceDelta(measurement, delta);
				const result = nextValue - amount;
				logDebug(state, `subtract(${amount})`, result, unit);
				return create(result, state);
			},

			multiply: (factor) => {
				const result = nextValue * factor;
				logDebug(state, `multiply(${factor})`, result, unit);
				return create(result, state);
			},

			divide: (divisor) => {
				const result = nextValue / divisor;
				logDebug(state, `divide(${divisor})`, result, unit);
				return create(result, state);
			},

			double: () => {
				const result = nextValue * 2;
				logDebug(state, 'double', result, unit);
				return create(result, state);
			},

			half: () => {
				const result = nextValue / 2;
				logDebug(state, 'half', result, unit);
				return create(result, state);
			},

			negation: (shouldNegate = true) => {
				const result = shouldNegate ? nextValue * -1 : nextValue;
				logDebug(state, 'negation', result, unit);
				return shouldNegate ? create(result, state) : measurement;
			},

			absolute: () => {
				const result = Math.abs(nextValue);
				logDebug(state, 'absolute', result, unit);
				return create(result, state);
			},

			debugChain: (label: string) => {
				// could extend with chained debug logs if needed
				return create(nextValue, {
					...state,
					enabled: true,
					label,
				});
			},

			debug: (label: string) => {
				logDebug(state, `debug(${label})`, nextValue, unit);
				return measurement;
			},
		};

		measurementIds.set(measurement, state.measurementId);
		return measurement;
	};

	return create(value);
};

// ----------------------
// Utility wrappers
// ----------------------

export const double = (measurement: IMeasurement) =>
	measurement.double();
export const half = (measurement: IMeasurement) => measurement.half();
export const negation = (m: IMeasurement, shouldNegate = true) =>
	m.negation(shouldNegate);

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

export const getMeasurementDebugEntries =
	(): MeasurementDebugEntry[] => [
		...getGlobalDebugStore().store,
	];

export const computeMeasurementDebugGroups = (
	entries: MeasurementDebugEntry[],
): MeasurementDebugGroups =>
	entries.reduce<MeasurementDebugGroups>((acc, entry) => {
		const group = acc[entry.measurementId] ?? [];
		const snapshot = group.find((item) => item.op === entry.op);
		if (snapshot) {
			snapshot.value = entry.value;
			snapshot.unit = entry.unit;
			snapshot.count = (snapshot.count ?? 1) + 1;
		} else {
			group.push({
				op: entry.op,
				value: entry.value,
				unit: entry.unit,
				count: entry.count ?? 1,
			});
		}
		acc[entry.measurementId] = group;
		return acc;
	}, {});

export const clearMeasurementDebugEntries = (): void => {
	const { store, index } = getGlobalDebugStore();
	store.length = 0;
	index.clear();
};

// ----------------------
// Type guards
// ----------------------

export function isCssLike(x: unknown): x is CssLike {
	return (
		typeof x === 'object' &&
		x !== null &&
		'css' in x &&
		typeof (x as { css: unknown }).css === 'function'
	);
}
