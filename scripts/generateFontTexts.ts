import fs from 'node:fs';
import path from 'node:path';
import {
	AVAILABLE_LOCALES,
	LOCALE_LOADERS,
} from '../src/lib/locales/translations/index.ts';

const MAX_UNIQUE_CHARS = process.env.MAX_FONT_TEXT_CHARS
	? Number(process.env.MAX_FONT_TEXT_CHARS)
	: 60;

const INCLUDE_BOTH_CASES =
	String(
		process.env.FONT_TEXT_INCLUDE_BOTH_CASES || '',
	).toLowerCase() === 'true' ||
	String(
		process.env.FONT_TEXT_INCLUDE_BOTH_CASES || '',
	).toLowerCase() === '1';

const FONT_CONFIG_JSON = path.resolve(
	'src',
	'data',
	'fonts.config.json',
);
const OUT_TS = path.resolve(
	'src',
	'data',
	'generated',
	'minimalFontText.gen.ts',
);

type FontCfgInput = {
	texts?: string[];
	keys?: string[];
	weights: string | string[];
	ital?: boolean;
	subsets?: string[];
};

type FontsConfig = Record<string, FontCfgInput>;

const collapseToUniqueChars = (
	strings: string[],
	{ stripWhitespace = false } = {},
) => {
	const joined = strings.join('');
	const raw = stripWhitespace ? joined.replace(/\s+/g, '') : joined;
	const nfc = raw.normalize('NFC');
	return Array.from(new Set(nfc)).join('');
};

const setHasChar = (arr: string[], ch: string) =>
	arr.some((value) => value === ch);

const addBothCasesIfNeeded = (text: string, enabled: boolean) => {
	if (!enabled || !text) return text;
	const set = new Set(text);
	for (const ch of text) {
		const upper = ch.toUpperCase();
		const lower = ch.toLowerCase();
		if (upper !== lower) {
			set.add(upper);
			set.add(lower);
		}
	}
	const original = Array.from(text);
	const extras = Array.from(set)
		.filter((c) => !setHasChar(original, c))
		.sort(
			(a, b) =>
				(a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0),
		);
	return original.join('') + extras.join('');
};

const valuesForKeysAcrossLocales = (
	keys: readonly string[],
	translations: Record<string, Record<string, string>>,
) => {
	const out: string[] = [];
	for (const key of keys) {
		for (const locale of AVAILABLE_LOCALES) {
			const value = translations[locale][key];
			if (typeof value === 'string') {
				out.push(value);
			}
		}
	}
	return out;
};

async function main() {
	if (!fs.existsSync(FONT_CONFIG_JSON)) {
		throw new Error(`Font config JSON missing: ${FONT_CONFIG_JSON}`);
	}

	const fontConfig = JSON.parse(
		fs.readFileSync(FONT_CONFIG_JSON, 'utf8'),
	) as FontsConfig;

	const translationsEntries = await Promise.all(
		AVAILABLE_LOCALES.map(async (locale) => {
			const mod = await LOCALE_LOADERS[locale]();
			return [
				locale,
				mod.default as Record<string, string>,
			] as const;
		}),
	);
	const translations = Object.fromEntries(translationsEntries) as Record<
		string,
		Record<string, string>
	>;

	const referenceLocale = AVAILABLE_LOCALES[0];
	const knownKeys = new Set(
		Object.keys(translations[referenceLocale]),
	);
	const unknownByFamily: Record<string, string[]> = {};

	for (const [
		family,
		cfg,
	] of Object.entries(fontConfig)) {
		const keys = Array.isArray(cfg.keys) ? cfg.keys : [];
		const unknown = keys.filter((key) => !knownKeys.has(key));
		if (unknown.length) {
			unknownByFamily[family] = unknown;
		}
	}

	if (Object.keys(unknownByFamily).length) {
		const lines = Object.entries(unknownByFamily)
			.map(
				([
					family,
					keys,
				]) => `  - ${family}: ${keys.join(', ')}`,
			)
			.join('\n');
		throw new Error(
			`fonts.config.json lists translation keys that do not exist in locale "${referenceLocale}":\n${lines}`,
		);
	}

	const result: Record<
		string,
		{
			texts?: string[];
			weights: string | string[];
			ital: boolean;
			subsets?: string[];
		}
	> = {};

	const summary: {
		family: string;
		usedText: boolean;
		glyphs: number;
		note?: string;
	}[] = [];
	const errors: string[] = [];
	let totalGlyphsIncluded = 0;

	for (const [
		family,
		cfg,
	] of Object.entries(fontConfig)) {
		const literalTexts = Array.isArray(cfg.texts) ? cfg.texts : [];
		const keys = Array.isArray(cfg.keys) ? cfg.keys : [];

		const fromLocales =
			keys.length > 0
				? valuesForKeysAcrossLocales(keys, translations)
				: [];
		const sources = [
			...literalTexts,
			...fromLocales,
		];

		let collapsed: string[] | undefined;
		let glyphCount = 0;

		if (sources.length) {
			let unique = collapseToUniqueChars(sources, {
				stripWhitespace: false,
			});
			unique = addBothCasesIfNeeded(unique, INCLUDE_BOTH_CASES);

			if (unique.length > MAX_UNIQUE_CHARS) {
				const preview = unique.slice(0, 80);
				errors.push(
					[
						`[generateFontTexts] Too many unique glyphs for "${family}": ${unique.length} (> ${MAX_UNIQUE_CHARS}).`,
						'This will make &text= brittle and likely not worth it.',
						`→ Action: remove "keys" (and/or "texts") for "${family}" in src/data/fonts.config.json so this family is emitted WITHOUT &text= (subset-only).`,
						`→ Sample of collected glyphs: "${preview}"${unique.length > 80 ? '…' : ''}`,
					].join('\n'),
				);
				collapsed = undefined;
				glyphCount = 0;
				summary.push({
					family,
					usedText: false,
					glyphs: 0,
					note: 'exceeded cutoff; omitted',
				});
			} else {
				collapsed = [
					unique,
				];
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
			texts: collapsed,
			weights: cfg.weights,
			ital: Boolean(cfg.ital),
			subsets: cfg.subsets,
		};
	}

	if (errors.length) {
		const help = [
			`One or more families exceeded MAX_UNIQUE_CHARS = ${MAX_UNIQUE_CHARS}.`,
			'Edit src/data/fonts.config.json and remove the "keys"/"texts" for those families (or adjust MAX_FONT_TEXT_CHARS).',
			'This will emit those families WITHOUT &text=, relying on subset-only requests.',
		].join('\n');
		throw new Error(`${errors.join('\n\n')}\n\n${help}`);
	}

	const header = `// AUTO-GENERATED — DO NOT EDIT
// Built from src/data/fonts.config.json and locale TypeScript definitions.
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
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
