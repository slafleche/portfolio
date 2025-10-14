// One-stop helpers for font weights + family defs + loading/validating fonts.config.json.
import type { FontFamilyDef } from './types';

// ---- Types expected from your JSON config ----
export type FontCfgInput = {
	texts?: string[];
	keys?: string[];
	weights: string | string[]; // e.g. "400..800", ["300..700"], ["400","700"]
	ital?: boolean;
	subsets?: string[];
};
export type FontsConfig = Record<string, FontCfgInput>;

// ---- Load raw JSON (Next.js/modern TS supports JSON imports) ----
// If your toolchain requires, keep the assert; otherwise you can drop it.
import rawJson from '../../data/fonts.config.json' assert { type: 'json' };
import type { IMeasurement } from './measurement';

// ----------------- internals -----------------
function toArray<T>(x: T | T[]): T[] {
	return Array.isArray(x)
		? x
		: [
				x,
			];
}

function parseRangeToken(token: string): {
	low: number;
	high: number;
} {
	const t = String(token).trim();
	const range = t.split('..').map((s) => s.trim());
	if (range.length === 1) {
		const n = Number(range[0]);
		return { low: n, high: n };
	}
	const a = Number(range[0]);
	const b = Number(range[1]);
	return {
		low: Math.min(a, b),
		high: Math.max(a, b),
	};
}

// ----------------- public helpers -----------------

/**
 * Merge one or more weight tokens into
 * a single {low, high} range.
 *
 * - "400..800" -> { low: 400, high: 800 }
 * - ["300..700"] -> { low: 300, high: 700
 *   }
 * - ["400","700"] -> { low: 400, high:
 *   700 }
 * - ["300..500","600..800"] -> { low:
 *   300, high: 800 }
 */
export function weightRangeFromConfig(weights: string | string[]): {
	low: number;
	high: number;
} {
	const tokens = toArray(weights).filter(Boolean);
	if (tokens.length === 0) return { low: 400, high: 700 };

	let low = Number.POSITIVE_INFINITY;
	let high = Number.NEGATIVE_INFINITY;

	for (const t of tokens) {
		const r = parseRangeToken(t);
		if (!Number.isFinite(r.low) || !Number.isFinite(r.high)) continue;
		if (r.low < low) low = r.low;
		if (r.high > high) high = r.high;
	}

	if (!Number.isFinite(low) || !Number.isFinite(high)) {
		return { low: 400, high: 700 };
	}
	return { low, high };
}

/**
 * Build a FontFamilyDef using
 * fonts.config.json so you don’t
 * hand-copy weight ranges.
 *
 * @param familyName E.g. "Titan One"
 * @param fallbacks E.g.
 *   ['Poppins','Helvetica','Arial','sans-serif']
 * @param cfgMap Parsed + validated
 *   FontsConfig (use the default export
 *   `fontsConfig`)
 * @param spacing IMeasurement only
 *   (e.g., m(0.3, 'rem'))
 */
export function makeFamilyDef(
	familyName: string,
	fallbacks: string[],
	cfgMap: FontsConfig,
	spacing: IMeasurement,
	offsetToFlushTop: IMeasurement, //Even with a correct line height, headings are never flush unless you adjust them
): FontFamilyDef {
	const cfg = cfgMap[familyName];
	const weights = cfg
		? weightRangeFromConfig(cfg.weights)
		: { low: 400, high: 700 };
	const primary = familyName.includes(' ')
		? `"${familyName}"`
		: familyName;
	return {
		family: [
			primary,
			...fallbacks,
		].join(', '),
		weights,
		spacing,
		offsetToFlushTop,
	};
}

// ----------------- loader/validator -----------------

/**
 * Convert an unknown JSON blob into a
 * typed FontsConfig with basic
 * validation/coercion. Throws helpful
 * errors if the structure is off.
 */
export function asFontsConfig(input: unknown): FontsConfig {
	if (!input || typeof input !== 'object') {
		throw new Error('fonts.config.json: root must be an object');
	}
	const src = input as Record<string, unknown>;
	const out: FontsConfig = {};

	for (const [
		family,
		v,
	] of Object.entries(src)) {
		if (!v || typeof v !== 'object') {
			throw new Error(
				`fonts.config.json: entry for "${family}" must be an object`,
			);
		}
		const cfg = v as Record<string, unknown>;

		// texts?: string[]
		const texts = Array.isArray(cfg.texts)
			? cfg.texts.map(String)
			: undefined;

		// keys?: string[]
		const keys = Array.isArray(cfg.keys)
			? cfg.keys.map(String)
			: undefined;

		// weights: string | string[]
		let weights: string | string[] | undefined = undefined;
		if (typeof cfg.weights === 'string') {
			weights = cfg.weights;
		} else if (Array.isArray(cfg.weights)) {
			weights = cfg.weights.map(String);
		}
		if (!weights) {
			throw new Error(
				`fonts.config.json: "${family}" is missing a valid "weights" (string or string[])`,
			);
		}

		// ital?: boolean
		const ital = typeof cfg.ital === 'boolean' ? cfg.ital : undefined;

		// subsets?: string[]
		const subsets = Array.isArray(cfg.subsets)
			? cfg.subsets.map(String)
			: undefined;

		out[family] = {
			texts,
			keys,
			weights,
			ital,
			subsets,
		};
	}

	return out;
}

// Create a single, validated config you can import anywhere.
const fontsConfig: FontsConfig = asFontsConfig(rawJson);
export default fontsConfig;
