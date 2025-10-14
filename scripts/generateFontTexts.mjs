/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import stripJsonComments from 'strip-json-comments';

// ---------- Config ----------
const MAX_UNIQUE_CHARS = process.env.MAX_FONT_TEXT_CHARS
	? Number(process.env.MAX_FONT_TEXT_CHARS)
	: 60; // cutoff

const INCLUDE_BOTH_CASES =
	String(
		process.env.FONT_TEXT_INCLUDE_BOTH_CASES || '',
	).toLowerCase() === 'true' ||
	String(
		process.env.FONT_TEXT_INCLUDE_BOTH_CASES || '',
	).toLowerCase() === '1';

// --- Paths ---
const LOCALES_DIR = path.resolve(
	'src',
	'lib',
	'locales',
	'translations',
); // JSONC inputs
const FONT_CONFIG_JSON = path.resolve(
	'src',
	'data',
	'fonts.config.json',
); // JSON config (keys/texts/weights/ital/subsets)
const OUT_TS = path.resolve(
	'src',
	'data',
	'generated',
	'minimalFontText.gen.ts',
); // TS output consumed by app

// --- Utils (match your locales script behavior) ---
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
			let j = i + 1;
			while (j < input.length && /\s/.test(input[j])) j++;
			if (j < input.length && (input[j] === '}' || input[j] === ']'))
				continue; // skip trailing comma
		}
		out += ch;
	}
	return out;
}

function readJsonc(filePath) {
	const raw = fs
		.readFileSync(filePath, 'utf8')
		.replace(/^\uFEFF/, '');
	const noComments = stripJsonComments(raw);
	const normalized = removeTrailingCommas(noComments);
	return JSON.parse(normalized);
}

function uniqueCharsFromStrings(
	strings,
	{ stripWhitespace = false } = {},
) {
	const joined = strings.join('');
	const raw = stripWhitespace ? joined.replace(/\s+/g, '') : joined;
	const nfc = raw.normalize('NFC');
	return Array.from(new Set(nfc)).join('');
}

/**
 * If enabled, ensure both uppercase and lowercase variants exist for
 * each alphabetic codepoint. Works for Latin (incl. accented letters)
 * via JS casing.
 */
function addBothCasesIfNeeded(s, enabled) {
	if (!enabled || !s) return s;
	const set = new Set(s);
	for (const ch of s) {
		const upper = ch.toUpperCase();
		const lower = ch.toLowerCase();
		// Only add when casing changes (avoid adding digits/punct/etc.)
		if (upper !== lower) {
			set.add(upper);
			set.add(lower);
		}
	}
	// Preserve stable order: original chars first, then any newly added in codepoint order
	const original = Array.from(s);
	const extras = Array.from(set)
		.filter((c) => !setHasChar(original, c))
		.sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
	return original.join('') + extras.join('');
}

function setHasChar(arr, ch) {
	for (const c of arr) if (c === ch) return true;
	return false;
}

// --- Load locales (all values are strings; your other generator validates) ---
if (!fs.existsSync(LOCALES_DIR)) {
	throw new Error(`Locales dir missing: ${LOCALES_DIR}`);
}
const localeFiles = fs
	.readdirSync(LOCALES_DIR)
	.filter((f) => f.endsWith('.jsonc'));
if (localeFiles.length === 0) {
	throw new Error(`No *.jsonc locales found in ${LOCALES_DIR}`);
}
const locales = localeFiles.map((f) =>
	readJsonc(path.join(LOCALES_DIR, f)),
);

// --- Load font config (plain JSON, no TS) ---
if (!fs.existsSync(FONT_CONFIG_JSON)) {
	throw new Error(`Font config JSON missing: ${FONT_CONFIG_JSON}`);
}
const fontConfig = JSON.parse(
	fs.readFileSync(FONT_CONFIG_JSON, 'utf8'),
); // { [family]: { keys?, texts?, weights, ital?, subsets? } }

// --- Resolve keys across ALL locales + merge literal texts, then collapse to unique chars ---
function valuesForKeysAcrossLocales(keys, localeObjs) {
	const out = [];
	for (const key of keys) {
		for (const loc of localeObjs) {
			const v = loc[key];
			if (typeof v === 'string') out.push(v);
		}
	}
	return out;
}

const result = {};
const errors = [];
const summary = []; // for printing final glyph counts
let totalGlyphsIncluded = 0;

for (const [family, cfg] of Object.entries(fontConfig)) {
	const literalTexts = Array.isArray(cfg.texts) ? cfg.texts : [];
	const keys = Array.isArray(cfg.keys) ? cfg.keys : [];

	const fromLocales = keys.length
		? valuesForKeysAcrossLocales(keys, locales)
		: [];
	const all = [...literalTexts, ...fromLocales];

	// If none provided, omit texts => subset-only later
	let collapsed;
	let glyphCount = 0;

	if (all.length) {
		let unique = uniqueCharsFromStrings(all, {
			stripWhitespace: false,
		});

		// NEW: expand to include both case variants, if enabled
		unique = addBothCasesIfNeeded(unique, INCLUDE_BOTH_CASES);

		// --- ENFORCE CUTOFF ---
		if (unique.length > MAX_UNIQUE_CHARS) {
			const preview = unique.slice(0, 80);
			errors.push(
				[
					`[generateFontText] Too many unique glyphs for "${family}": ${unique.length} (> ${MAX_UNIQUE_CHARS}).`,
					`This will make &text= brittle and likely not worth it.`,
					`→ Action: remove "keys" (and/or "texts") for "${family}" in src/data/fonts.config.json so this family is emitted WITHOUT &text= (subset-only).`,
					`→ Sample of collected glyphs: "${preview}"${unique.length > 80 ? '…' : ''}`,
				].join('\n'),
			);
			collapsed = undefined; // Skip &text= for this family
			glyphCount = 0;
			summary.push({
				family,
				usedText: false,
				glyphs: 0,
				note: 'exceeded cutoff; omitted',
			});
		} else {
			collapsed = [unique]; // single collapsed unique-char string
			glyphCount = unique.length;
			totalGlyphsIncluded += glyphCount;
			summary.push({
				family,
				usedText: true,
				glyphs: glyphCount,
				note: INCLUDE_BOTH_CASES ? 'both-cases' : 'as-is',
			});
		}
	} else {
		collapsed = undefined;
		summary.push({
			family,
			usedText: false,
			glyphs: 0,
			note: 'no keys/texts; subset-only',
		});
	}

	result[family] = {
		texts: collapsed, // single collapsed unique-char string OR undefined
		weights: cfg.weights, // pass-through
		ital: !!cfg.ital, // pass-through
		subsets: cfg.subsets, // optional pass-through
	};
}

// If any families exceeded cutoff, throw a single combined error with guidance
if (errors.length) {
	const help = [
		`One or more families exceeded MAX_UNIQUE_CHARS = ${MAX_UNIQUE_CHARS}.`,
		`Edit src/data/fonts.config.json and remove the "keys"/"texts" for those families (or set MAX_FONT_TEXT_CHARS env var to adjust).`,
		`This will emit those families WITHOUT &text=, relying on "subset" only.`,
	].join('\n');
	throw new Error(`${errors.join('\n\n')}\n\n${help}`);
}

// --- Emit TypeScript module (uses relative import to your types) ---
const header = `// AUTO-GENERATED — DO NOT EDIT
// Built from src/data/fonts.config.json and locale JSONC files.
import type { FontConfig } from '../../styles/helpers/types';

const minimalFontText: Record<string, FontConfig> = `;

const body = JSON.stringify(result, null, 2);

const footer = `;

export default minimalFontText;
`;

fs.mkdirSync(path.dirname(OUT_TS), {
	recursive: true,
});
fs.writeFileSync(OUT_TS, header + body + footer, 'utf8');

// --- Print per-family glyph counts + summary line ---
console.log(
	`✅ Wrote ${OUT_TS} (cutoff=${MAX_UNIQUE_CHARS}, bothCases=${INCLUDE_BOTH_CASES})`,
);
for (const row of summary) {
	const flag = row.usedText ? 'text=✓' : 'text=—';
	console.log(
		` • ${row.family}: ${flag} glyphs=${row.glyphs}${row.note ? ` (${row.note})` : ''}`,
	);
}
console.log(
	`Σ total glyphs across families using &text=: ${totalGlyphsIncluded}`,
);
