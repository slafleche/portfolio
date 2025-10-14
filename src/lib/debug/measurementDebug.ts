type DebugEntry = {
	id: string;
	op: string;
	value: number;
	unit: string;
	count?: number;
	measurementId: string;
};

type DebugOperation = {
	op: string;
	value: number;
	unit: string;
	count: number;
};

type DebugGroups = Record<string, DebugOperation[]>;

type MeasurementDebugOptions = {
	clear?: boolean;
	dedupe?: boolean;
	group?: boolean;
	showCount?: boolean;
};

const formatCount = (count: number | undefined, include: boolean) =>
	include && count && count > 1 ? ` ×${count}` : '';

const logGrouped = (groups: DebugGroups, includeCount: boolean) => {
	const labels = Object.keys(groups);
	if (labels.length === 0) {
		console.info('[measurement-debug] no entries');
		return;
	}
	const totalOps = labels.reduce((sum, label) => sum + groups[label].length, 0);
	const header = `[measurement-debug] ${totalOps} op${
		totalOps === 1 ? '' : 's'
	} across ${labels.length} label${labels.length === 1 ? '' : 's'}`;
	console.groupCollapsed(header);
	labels.forEach((label) => {
		const ops = groups[label];
		const summary = ops
			.map(
				(operation) =>
					`${operation.op} → ${operation.value}${operation.unit}${formatCount(
						operation.count,
						includeCount,
					)}`,
			)
			.join('  •  ');
		console.log(`[${label}] ${summary || 'no operations'}`);
		if (ops.length > 0) {
			const labelHeader = `[${label}] details (${ops.length} op${
				ops.length === 1 ? '' : 's'
			})`;
			console.groupCollapsed(labelHeader);
			ops.forEach((operation, index) => {
				console.log(
					`#${index} %c${operation.op}%c => ${operation.value}${operation.unit}${formatCount(
						operation.count,
						includeCount,
					)}`,
					'color: #2563eb;',
					'color: inherit;',
				);
			});
			if (typeof console.table === 'function') {
				console.table(
					ops.map((operation, index) => ({
						'#': index,
						op: operation.op,
						value: `${operation.value}${operation.unit}`,
						...(includeCount ? { count: operation.count } : {}),
					})),
				);
			}
			console.groupEnd();
		}
	});
	console.groupEnd();
};

const logEntries = (entries: DebugEntry[], includeCount: boolean) => {
	if (entries.length === 0) {
		console.info('[measurement-debug] no entries');
		return;
	}
	console.groupCollapsed(
		`[measurement-debug] ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`,
	);
	entries.forEach((entry, index) => {
		console.log(
			`#${index} %c${entry.id}%c :: %c${entry.op}%c => ${entry.value}${entry.unit}${formatCount(
				entry.count,
				includeCount,
			)}`,
			'color: #d97706; font-weight: 600;',
			'color: inherit;',
			'color: #2563eb;',
			'color: inherit;',
		);
	});
	console.groupEnd();
};

const groupEntriesClientSide = (entries: DebugEntry[]): DebugGroups => {
	const grouped: DebugGroups = {};
	const measurementToLabel = new Map<string, string>();
	entries.forEach((entry) => {
		const candidate = entry.id;
		const existingLabel = measurementToLabel.get(entry.measurementId);
		const key = existingLabel ?? candidate;
		if (!existingLabel) {
			measurementToLabel.set(entry.measurementId, key);
		}
		const list = grouped[key] ?? (grouped[key] = []);
		const existing = list.find((op) => op.op === entry.op);
		if (existing) {
			existing.value = entry.value;
			existing.unit = entry.unit;
			existing.count = entry.count ?? existing.count;
		} else {
			list.push({
				op: entry.op,
				value: entry.value,
				unit: entry.unit,
				count: entry.count ?? 1,
			});
		}
	});
	return grouped;
};

export async function measurementDebug({
	clear = false,
	dedupe = false,
	group = false,
	showCount = false,
}: MeasurementDebugOptions = {}) {
	try {
		const params = new URLSearchParams();
		if (clear) params.set('clear', '1');
		if (dedupe) params.set('dedupe', '1');
		if (group) params.set('group', '1');
		const query = params.toString();
		const url = `/api/measurement-debug${query ? `?${query}` : ''}`;
		const response = await fetch(url, { method: 'GET' });
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}
		const payload = await response.json();
		const entries: DebugEntry[] = Array.isArray(payload.entries)
			? payload.entries
			: [];
		const groupsData: DebugGroups | undefined = group
			? payload.groups && typeof payload.groups === 'object'
				? payload.groups
				: groupEntriesClientSide(entries)
			: undefined;

		if (group && groupsData) {
			logGrouped(groupsData, showCount);
			return groupsData;
		}

		logEntries(entries, showCount);
		return entries;
	} catch (error) {
		console.error('[measurement-debug] request failed', error);
		throw error;
	}
}

export function measurementDebugClear() {
	return measurementDebug({ clear: true });
}
