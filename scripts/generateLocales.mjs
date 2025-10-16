import fs from 'node:fs';
import path from 'node:path';
import stripJsonComments from 'strip-json-comments';

/**
 * Generates:
 *
 * - Src/data/generated/locales.gen.json
 * - Src/data/generated/locales.gen.ts
 *
 * Includes:
 *
 * - AVAILABLE_LOCALES
 * - LOCALE_LABELS
 * - TRANSLATIONS
 * - FONT_MIN_SETS.perLocale[locale][family] = "<unique chars for that
 *   locale/font>"
 *
 * Reads:
 *
 * - Src/lib/locales/translations/*.jsonc (your raw locale inputs)
 * - Src/data/fonts.config.json (font keys/texts/weights/ital/subsets)
 *
 * Notes:
 *
 * - Only per-locale minimal sets are generated here (no union).
 * - All values in translation files must be strings (enforced).
 * - Keys across locales must match the reference locale (enforced).
 * - NEW: validates that every key listed in fonts.config.json exists in
 *   the translations, else throws.
 */

// -------------------- CONFIG --------------------
const SRC_DIR = path.resolve('src', 'lib', 'locales', 'translations'); // your JSONC inputs
const OUT_DIR = path.resolve('src', 'data', 'generated'); // generated outputs
const OUT_JSON = path.join(OUT_DIR, 'locales.gen.json'); // generated JSON
const OUT_TS = path.join(OUT_DIR, 'locales.gen.ts'); // generated TS
const FONT_CONFIG_JSON = path.resolve(
	'src',
	'data',
	'fonts.config.json',
); // font config (JSON)
const MINIFY = process.env.MINIFY === '1'; // MINIFY=1 yarn locales
const REF_LOCALE = 'en'; // reference locale to compare keys against

// -------------------- UTILS --------------------
const pretty = (obj) => JSON.stringify(obj, null, MINIFY ? 0 : 2);

// Remove trailing commas from JSON-like text (outside strings)
function removeTrailingCommas(input) {
	let out = '';
	let inString = false;
	let stringQuote = '';
	let escaping = false;
	for (let i = 0; i < input.length; i++) {
		const ch = input[i];
		if (inString) {
			out += ch;
			if (escaping) {
				escaping = false;
			} else if (ch === '\\') {
				escaping = true;
			} else if (ch === stringQuote) {
				inString = false;
				stringQuote = '';
			}
			continue;
		}
		if (ch === '"' || ch === "'") {
			inString = true;
			stringQuote = ch;
			out += ch;
			continue;
		}
		if (ch === ',') {
			// look ahead for next non-whitespace char
			let j = i + 1;
			while (j < input.length && /\s/.test(input[j])) j++;
			if (
				j < input.length &&
				(input[j] === '}' || input[j] === ']')
			) {
				// skip writing this trailing comma
				continue;
			}
			out += ch;
			continue;
		}
		out += ch;
	}
	return out;
}

// Read JSONC (comments, trailing commas, etc.)
function readJsonc(p) {
	const raw = fs.readFileSync(p, 'utf8');
	// Remove UTF-8 BOM, strip comments, then remove trailing commas
	const noBom = raw.replace(/^\uFEFF/, '');
	const noComments = stripJsonComments(noBom);
	const normalized = removeTrailingCommas(noComments);
	return JSON.parse(normalized);
}

// Collapse an array of strings to one unique-char string
function collapseToUniqueChars(
	strings,
	{ stripWhitespace = false } = {},
) {
	const joined = strings.join('');
	const raw = stripWhitespace ? joined.replace(/\s+/g, '') : joined;
	const nfc = raw.normalize('NFC');
	return Array.from(new Set(nfc)).join('');
}

// Collect specific keys from a single locale's map
function collectStringsForKeys(keys, translationsMap) {
	const out = [];
	for (const k of keys) {
		const val = translationsMap[k];
		if (typeof val === 'string') out.push(val);
	}
	return out;
}

// -------------------- 1) LOAD LOCALES --------------------
if (!fs.existsSync(SRC_DIR))
	throw new Error(`Locales dir missing: ${SRC_DIR}`);
const files = fs
	.readdirSync(SRC_DIR)
	.filter((f) => f.endsWith('.jsonc'));
if (files.length === 0)
	throw new Error(`No *.jsonc locales found in ${SRC_DIR}`);

// Parse all locales
const entries = files.map((file) => {
	const base = path.basename(file);
	const locale = base.replace(/\.(jsonc)$/, '');
	const json = readJsonc(path.join(SRC_DIR, file));

	// require a non-empty "label"
	if (typeof json.label !== 'string' || !json.label.trim()) {
		throw new Error(
			`Locale "${locale}" is missing a non-empty "label" string`,
		);
	}

	// require all values to be strings (including label)
	for (const [
		k,
		v,
	] of Object.entries(json)) {
		if (typeof v !== 'string') {
			throw new Error(
				`Locale "${locale}" has non-string value at key "${k}"`,
			);
		}
	}

	return [
		locale,
		json,
	];
});

// stable order
entries.sort(
	(
		[
			a,
		],
		[
			b,
		],
	) => a.localeCompare(b),
);

// -------------------- 2) KEY EQUALITY CHECK --------------------
const refEntry =
	entries.find(
		([
			l,
		]) => l === REF_LOCALE,
	) ?? entries[0];
const [
	refLocale,
	refJson,
] = refEntry;
const refKeys = Object.keys(refJson).sort();

let hasIssues = false;
for (const [
	loc,
	json,
] of entries) {
	const keys = Object.keys(json).sort();
	const missing = refKeys.filter((k) => !keys.includes(k));
	const extra = keys.filter((k) => !refKeys.includes(k));

	if (missing.length || extra.length) {
		hasIssues = true;
		console.error(
			`\n❌ Inconsistencies in "${loc}" vs "${refLocale}":`,
		);
		if (missing.length)
			console.error('  Missing keys:', missing.join(', '));
		if (extra.length)
			console.error('  Extra keys:  ', extra.join(', '));
	}
}
if (hasIssues) process.exit(1); // hard fail before dev/build

// -------------------- 3) BUILD BASE PAYLOADS --------------------
const AVAILABLE_LOCALES = entries.map(
	([
		l,
	]) => l,
);
const LOCALE_LABELS = Object.fromEntries(
	entries.map(
		([
			l,
			json,
		]) => [
			l,
			json.label,
		],
	),
);
const TRANSLATIONS = Object.fromEntries(
	entries.map(
		([
			l,
			json,
		]) => [
			l,
			json,
		],
	),
);

// -------------------- 4) LOAD FONT CONFIG --------------------
if (!fs.existsSync(FONT_CONFIG_JSON)) {
	throw new Error(`Font config JSON missing: ${FONT_CONFIG_JSON}`);
}
const fontsConfig = JSON.parse(
	fs.readFileSync(FONT_CONFIG_JSON, 'utf8'),
);
// Expected shape per family:
//   { keys?: string[], texts?: string[], weights: string|string[], ital?: boolean, subsets?: string[] }

// NEW: Validate that every key listed in fonts.config.json exists in translations
const refKeySet = new Set(refKeys);
const unknownMap = {};
for (const [
	family,
	cfg,
] of Object.entries(fontsConfig)) {
	const keys = Array.isArray(cfg.keys) ? cfg.keys : [];
	const unknown = keys.filter((k) => !refKeySet.has(k));
	if (unknown.length) {
		unknownMap[family] = unknown;
	}
}
if (Object.keys(unknownMap).length) {
	const lines = Object.entries(unknownMap)
		.map(
			([
				fam,
				list,
			]) => `  - ${fam}: ${list.join(', ')}`,
		)
		.join('\n');
	const hint = `Known keys sample (${Math.min(10, refKeys.length)} of ${refKeys.length}): ${refKeys.slice(0, 10).join(', ')}${refKeys.length > 10 ? ' …' : ''}`;
	throw new Error(
		`fonts.config.json lists translation keys that do not exist in "${refLocale}" translations:\n${lines}\n\n` +
			`Fix the key names or add them to your locale files.\n${hint}`,
	);
}

// -------------------- 5) COMPUTE PER-LOCALE MINIMAL CHAR SETS --------------------
/**
 * FONT_MIN_SETS.perLocale = { [locale]: { [family]: "<unique chars>"
 *
 * | "" // empty string means: no &text= param recommended } }
 */
const FONT_MIN_SETS = { perLocale: {} };

for (const [
	locale,
	json,
] of entries) {
	const perFont = {};
	for (const [
		family,
		cfg,
	] of Object.entries(fontsConfig)) {
		const literalTexts = Array.isArray(cfg.texts) ? cfg.texts : [];
		const keys = Array.isArray(cfg.keys) ? cfg.keys : [];

		// Only collect values from THIS locale
		const fromKeys = keys.length
			? collectStringsForKeys(keys, json)
			: [];
		const allStrings = [
			...literalTexts,
			...fromKeys,
		];

		// If none provided, store empty string (means: subset-only; no &text=)
		const collapsed = allStrings.length
			? collapseToUniqueChars(allStrings, { stripWhitespace: false })
			: '';

		perFont[family] = collapsed; // string (possibly empty)
	}
	FONT_MIN_SETS.perLocale[locale] = perFont;
}

// -------------------- 6) WRITE GENERATED FILES --------------------
fs.mkdirSync(OUT_DIR, {
	recursive: true,
});

// JSON (source of truth for later steps)
const jsonPayload = {
	AVAILABLE_LOCALES,
	LOCALE_LABELS,
	TRANSLATIONS,
	FONT_MIN_SETS,
};
fs.writeFileSync(OUT_JSON, pretty(jsonPayload), 'utf8');
console.log('✨ locales.gen.json updated!');

// TS (optional typed view for app-side, mirrors JSON)
const tsPayload = `// AUTO-GENERATED FILE — DO NOT EDIT
export const AVAILABLE_LOCALES = ${pretty(AVAILABLE_LOCALES)} as const;
export type Locale = typeof AVAILABLE_LOCALES[number];

export const LOCALE_LABELS: Record<Locale, string> = ${pretty(LOCALE_LABELS)};

export const TRANSLATIONS = ${pretty(TRANSLATIONS)} as const;
export type Messages = typeof TRANSLATIONS[Locale];

// Per-locale minimal character sets for each font family.
// Empty string means: prefer no &text= (subset-only) for that family/locale.
export const FONT_MIN_SETS = ${pretty(FONT_MIN_SETS)} as const;
`;
fs.writeFileSync(OUT_TS, tsPayload, 'utf8');
console.log('✨ locales.gen.ts updated!');

console.log('✅ All locale artifacts generated in:', OUT_DIR);
