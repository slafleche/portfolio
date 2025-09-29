// We accept multiple input shapes here to keep call sites ergonomic while

import { CssLike } from '../utilities.css';

const isDev =
	typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

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

export type MeasurementDebugGroups = Record<string, DebugOperationSnapshot[]>;

type MeasurementDebugOptions = {
	clear?: boolean;
	dedupe?: boolean;
	group?: boolean;
	showCount?: boolean;
};

declare global {
	// eslint-disable-next-line no-var
	var __MEASUREMENT_DEBUG__: DebugEntry[] | undefined;
	// eslint-disable-next-line no-var
	var __MEASUREMENT_DEBUG_INDEX__: Map<string, number> | undefined;
	// eslint-disable-next-line no-var
	var measurementDebug:
		| ((options?: MeasurementDebugOptions) => Promise<unknown>)
		| undefined;
	// eslint-disable-next-line no-var
	var measurementDebugClear: (() => Promise<unknown>) | undefined;
}

type DebugState = {
	enabled: boolean;
	label?: string;
	autoLabel?: string;
	measurementId: string;
};

const ensureDebugStore = () => {
	if (!enableDebug || typeof globalThis === 'undefined') {
		return undefined;
	}
	if (!globalThis.__MEASUREMENT_DEBUG__) {
		globalThis.__MEASUREMENT_DEBUG__ = [];
	}
	return globalThis.__MEASUREMENT_DEBUG__;
};

const ensureDebugIndex = () => {
	if (!enableDebug || typeof globalThis === 'undefined') {
		return undefined;
	}
	if (!globalThis.__MEASUREMENT_DEBUG_INDEX__) {
		globalThis.__MEASUREMENT_DEBUG_INDEX__ = new Map();
	}
	const index = globalThis.__MEASUREMENT_DEBUG_INDEX__;
	const store = ensureDebugStore();
	if (!store) return undefined;
	if (index.size === 0 && store.length > 0) {
		const deduped: DebugEntry[] = [];
		for (const entry of store) {
			const op = entry.op;
			const measurementId =
				entry.measurementId ?? `legacy-${measurementIdCounter++}`;
			entry.measurementId = measurementId;
			if (measurementId.startsWith('legacy-')) {
				continue;
			}
			const key = `${measurementId}|${op}`;

			const position = index.get(key);
			if (typeof position === 'number') {
				const target = deduped[position];
				if (target) {
					target.id = entry.id ?? target.id;
					target.value = entry.value;
					target.unit = entry.unit;
					target.count = (target.count ?? 1) + (entry.count ?? 1);
				}
			} else {
				index.set(key, deduped.length);
				deduped.push({
					id: entry.id ?? 'measurement',
					op,
					value: entry.value,
					unit: entry.unit,
					count: entry.count ?? 1,
					measurementId,
				});
			}
		}
		globalThis.__MEASUREMENT_DEBUG__ = deduped;
	}
	return index;
};

const logDebug = (
	state: DebugState | undefined,
	operation: string,
	value: number,
	unit: string,
) => {
	if (!enableDebug || !state?.enabled) return;
	const store = ensureDebugStore();
	const index = ensureDebugIndex();
	if (!store || !index) return;
	const measurementId = state.measurementId;
	const id = state.label ?? state.autoLabel ?? 'measurement';
	const key = `${measurementId}|${operation}`;
	const existing = index.get(key);
	if (typeof existing === 'number') {
		const entry = store[existing];
		if (entry) {
			entry.id = id;
			entry.value = value;
			entry.unit = unit;
			entry.count = (entry.count ?? 1) + 1;
		}
		return;
	}
	index.set(key, store.length);
	store.push({
		id,
		op: operation,
		value,
		unit,
		count: 1,
		measurementId,
	});
};

// ensuring that this helper always outputs strings.
export type MeasurementLike =
	| { value: number; unit?: string }
	| CssLike
	| string
	| undefined;

// Object representing a CSS measurement (eg. "10px" or "30vh");
export interface IMeasurement {
	value: number;
	unit?: string;
	css: () => string;
	add: (delta: number) => IMeasurement;
	subtract: (delta: number) => IMeasurement;
	multiply: (factor: number) => IMeasurement;
	divide: (divisor: number) => IMeasurement;
	double: () => IMeasurement;
	half: () => IMeasurement;
	negation: (shouldNegate?: boolean) => IMeasurement;
	absolute: () => IMeasurement;
	debugChain: (debugId: string) => IMeasurement;
	debug: (debugId: string) => IMeasurement;
}

const measurementLabels = new WeakMap<IMeasurement, string>();
const measurementIds = new WeakMap<IMeasurement, string>();
let measurementAutoLabelCounter = 0;
let measurementIdCounter = 0;

const rememberMeasurementMeta = (measurement: IMeasurement, state: DebugState) => {
	measurementIds.set(measurement, state.measurementId);
	const label = state.label ?? state.autoLabel;
	if (label) {
		measurementLabels.set(measurement, label);
	}
};

const getMeasurementId = (measurement: IMeasurement, state?: DebugState) =>
	state?.measurementId ?? measurementIds.get(measurement);

const assignMeasurementLabel = (measurement: IMeasurement, label: string) => {
	measurementLabels.set(measurement, label);
};

const getMeasurementLabel = (measurement: IMeasurement, state?: DebugState) =>
	state?.label ?? measurementLabels.get(measurement) ?? state?.autoLabel;

const generateAutoLabel = () => `measurement-${measurementAutoLabelCounter++}`;

const ensureDebugId = (label: string | undefined, measurement: IMeasurement) => {
	const trimmed = label?.trim() ?? '';
	if (trimmed) return trimmed;
	const existing = measurementLabels.get(measurement)?.trim();
	if (existing) return existing;
	throw new Error(
		'`debugChain` and `debug` require a debugging ID label: pass a descriptive string such as "logoItem".',
	);
};

// Allows keeping measurement values as a number for easier math,
// and then convert to string for use
export const m = (value: number, unit: string = 'px'): IMeasurement => {
	const measurementId = `m-${measurementIdCounter++}`;

	const create = (nextValue: number, debug?: DebugState): IMeasurement => {
		const state =
			debug ?? ({ enabled: false, measurementId } as DebugState);
		if (!state.measurementId) {
			state.measurementId = measurementId;
		}
	const measurement: IMeasurement = {
			value: nextValue,
			unit,
			css: () => {
				logDebug(state, 'css', nextValue, unit);
				return `${nextValue}${unit}`;
			},
			add: (delta: number) => {
				const result = nextValue + delta;
				logDebug(state, `add(${delta})`, result, unit);
				return create(result, state);
			},
			subtract: (delta: number) => {
				const result = nextValue - delta;
				logDebug(state, `subtract(${delta})`, result, unit);
				return create(result, state);
			},
			multiply: (factor: number) => {
				const result = nextValue * factor;
				logDebug(state, `multiply(${factor})`, result, unit);
				return create(result, state);
			},
			divide: (divisor: number) => {
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
					if (!shouldNegate) return measurement;
					const result = nextValue * -1;
					logDebug(state, 'negation', result, unit);
					return create(result, state);
				},
			absolute: () => {
				const result = Math.abs(nextValue);
				logDebug(state, 'absolute', result, unit);
				return create(result, state);
			},
			debugChain: (label: string) => {
				if (!enableDebug) return measurement;
			const resolvedLabel = ensureDebugId(label, measurement);
			assignMeasurementLabel(measurement, resolvedLabel);
			const nextState: DebugState = {
				enabled: true,
				label: resolvedLabel,
				autoLabel: resolvedLabel,
				measurementId: state.measurementId,
			};
				logDebug(nextState, 'debugChain', nextValue, unit);
				return create(nextValue, nextState);
			},
			debug: (label: string) => {
				if (!enableDebug) return measurement;
				const resolvedLabel = ensureDebugId(label, measurement);
				assignMeasurementLabel(measurement, resolvedLabel);
				const logState: DebugState = {
					enabled: true,
					label: resolvedLabel,
					autoLabel: resolvedLabel,
					measurementId: state.measurementId,
				};
				logDebug(logState, 'debug', nextValue, unit);
				return measurement;
			},
		};

		rememberMeasurementMeta(measurement, state);

		return measurement;
	};

	return create(value);
};

export const double = (measurement: IMeasurement) => measurement.double();
export const half = (measurement: IMeasurement) => measurement.half();
export const negation = (measurement: IMeasurement, shouldNegate = true) =>
	measurement.negation(shouldNegate);
export const debugChain = (measurement: IMeasurement, debugId: string) =>
	measurement.debugChain(debugId);
export const debug = (measurement: IMeasurement, debugId: string) =>
	measurement.debug(debugId);

export const getMeasurementDebugEntries = () => {
	ensureDebugIndex();
	return ensureDebugStore()?.slice() ?? [];
};

const isMeaningfulLabel = (label?: string) =>
	Boolean(label && !/^measurement(?:-\d+)?$/.test(label));

const migrateGroupLabel = (
	grouped: MeasurementDebugGroups,
	measurementToLabel: Map<string, string>,
	labelUsage: Map<string, number>,
	measurementId: string,
	currentLabel: string,
) => {
	const existingKey = measurementToLabel.get(measurementId);
	if (!existingKey) {
		let desiredLabel = currentLabel;
		if (!isMeaningfulLabel(desiredLabel)) {
			desiredLabel = currentLabel || generateAutoLabel();
		}
		let finalLabel = desiredLabel;
		if (grouped[finalLabel]) {
			const next = (labelUsage.get(desiredLabel) ?? 0) + 1;
			labelUsage.set(desiredLabel, next);
			finalLabel = `${desiredLabel}#${next}`;
		}
		measurementToLabel.set(measurementId, finalLabel);
		grouped[finalLabel] = grouped[finalLabel] ?? [];
		return finalLabel;
	}
	if (
		existingKey &&
		isMeaningfulLabel(currentLabel) &&
		!isMeaningfulLabel(existingKey)
	) {
		const lastOps = grouped[existingKey] ?? [];
		delete grouped[existingKey];
		let finalLabel = currentLabel;
		if (grouped[finalLabel]) {
			const next = (labelUsage.get(finalLabel) ?? 0) + 1;
			labelUsage.set(finalLabel, next);
			finalLabel = `${finalLabel}#${next}`;
		}
		grouped[finalLabel] = lastOps;
		measurementToLabel.set(measurementId, finalLabel);
		return finalLabel;
	}
	return existingKey;
};

const updateOperationList = (
	operations: DebugOperationSnapshot[],
	entry: DebugEntry,
) => {
	const existing = operations.find((item) => item.op === entry.op);
	if (existing) {
		existing.value = entry.value;
		existing.unit = entry.unit;
		existing.count = entry.count ?? existing.count;
	} else {
		operations.push({
			op: entry.op,
			value: entry.value,
			unit: entry.unit,
			count: entry.count ?? 1,
		});
	}
};

const buildMeasurementDebugGroups = (
	entries: DebugEntry[],
): MeasurementDebugGroups => {
	const grouped: MeasurementDebugGroups = {};
	const measurementToLabel = new Map<string, string>();
	const labelUsage = new Map<string, number>();

	for (const entry of entries) {
		if (!entry.measurementId || entry.measurementId.startsWith('legacy-')) {
			continue;
		}
		const candidateLabel = entry.id ?? 'measurement';
		const groupKey = migrateGroupLabel(
			grouped,
			measurementToLabel,
			labelUsage,
			entry.measurementId,
			candidateLabel,
		);
		const operations = grouped[groupKey] ?? (grouped[groupKey] = []);
		updateOperationList(operations, entry);
	}

	return grouped;
};

export const getMeasurementDebugGroups = (): MeasurementDebugGroups => {
	const store = ensureDebugStore();
	if (!store) return {};
	return buildMeasurementDebugGroups(store);
};

export const computeMeasurementDebugGroups = (
	entries: DebugEntry[],
): MeasurementDebugGroups => buildMeasurementDebugGroups(entries);

const attachConsoleHelper = () => {
	if (!enableDebug || typeof globalThis === 'undefined') return;
	if (globalThis.measurementDebug) return;
	const { console } = globalThis;
	if (!console) return;
	globalThis.measurementDebug = async (options?: MeasurementDebugOptions) => {
		const mod = await import('../../lib/debug/measurementDebug');
		return mod.measurementDebug({ dedupe: true, group: true, ...options });
	};
	globalThis.measurementDebugClear = async () => {
		const mod = await import('../../lib/debug/measurementDebug');
		return mod.measurementDebugClear();
	};
	console.info(
		'[measurement] measurementDebug() helper attached – runs /api/measurement-debug',
	);
};

attachConsoleHelper();

export {};

export const modify = (
	oldMeasurement: IMeasurement,
	newVal: number,
): IMeasurement => {
	return m(newVal, oldMeasurement.unit ?? 'px');
};

export const parseStringMeasurement = (cssValue: string): IMeasurement => {
	let value = cssValue.trim();
	const unit = value.replace(/^-?(0|[1-9]\d*)?([.][0-9]*)?/, '');
	value = value.substring(0, value.length - unit.length);
	if (value === '-0') {
		value = '0';
	}
	const finalValue = Number(value);
	const finalUnit = unit.trim() || 'px';

	return m(finalValue, finalUnit);
};
