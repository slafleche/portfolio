/**
 * Helper for generating optimized
 * Google Fonts CSS API URLs.
 *
 * Supports:
 *
 * - Per-font texts -> &text=...
 *   (omit/empty => no text param, just
 *   subset(s))
 * - Per-font weights -> "400" |
 *   ["400","700"] | ["100..900"]
 * - Italics -> builds
 *   :ital,wght@0,400;0,700;1,400;1,700
 *   (sorted tuples)
 * - Per-font subsets (override global
 *   default of ["latin"])
 * - Global options (display, subsets,
 *   stripWhitespaceFromText)
 * - RawAxis escape hatch to pass a full
 *   axis string verbatim
 */

export type FontConfig = {
	texts?: string[]; // collapsed unique-char string array or omitted
	weights: string | string[]; // e.g. "400", ["400","700"], "100..900"
	ital?: boolean; // include italics axis as well
	subsets?: string[]; // per-font override (default is ["latin"])
	rawAxis?: string; // advanced: e.g. "ital,wght@0,100..900;1,100..900"
};

export type FontConfigMap = Record<string, FontConfig>;

export type GoogleFontGlobalOptions = {
	display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
	subsets?: string[]; // default subsets if font doesn't specify
	stripWhitespaceFromText?: boolean;
};

/* ---------- internals ---------- */

function toArray<T>(x: T | T[] | undefined): T[] {
	return Array.isArray(x)
		? x
		: x !== undefined
			? [
					x,
				]
			: [];
}

/**
 * Numeric sort key for a weight token
 * ("400" or "100..900")
 */
function sortKey(token: string): number {
	const m = String(token).match(/^(\d+)(?:\.\.(\d+))?$/);
	return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

/**
 * De-dupe and sort weight tokens in
 * ascending order
 */
function normalizeAndSortWeights(weights: string[]): string[] {
	const uniq = Array.from(new Set(weights.filter(Boolean)));
	return uniq.sort((a, b) => sortKey(a) - sortKey(b));
}

/** Encode family for API (spaces -> '+') */
function encodeFamilyName(family: string): string {
	return family.trim().replace(/\s+/g, '+');
}

/** Build the :axis@... segment */
function buildAxisParam(cfg: FontConfig): string {
	// raw override
	if (cfg.rawAxis && cfg.rawAxis.trim()) {
		return `:${cfg.rawAxis.trim()}`;
	}

	const weights = normalizeAndSortWeights(toArray(cfg.weights));
	if (weights.length === 0) return '';

	if (cfg.ital) {
		// Tuples MUST be sorted: all 0,* first (roman), then all 1,* (italic), each by weight asc
		const roman = weights.map((w) => `0,${w}`);
		const italic = weights.map((w) => `1,${w}`);
		return `:ital,wght@${[
			...roman,
			...italic,
		].join(';')}`;
	}

	return `:wght@${weights.join(';')}`;
}

/** Build &text=... if texts provided */
function buildTextParam(
	texts: string[] | undefined,
	stripWhitespaceFromText: boolean,
): string {
	if (!texts || texts.length === 0) return '';
	const joined = texts.join('');
	const raw = stripWhitespaceFromText
		? joined.replace(/\s+/g, '')
		: joined;
	const uniqueChars = Array.from(new Set(raw));
	if (uniqueChars.length === 0) return '';
	return `&text=${encodeURIComponent(uniqueChars.join(''))}`;
}

/* ---------- public ---------- */

/**
 * Main generator: one URL per font
 * family
 */
export function generateGoogleFontUrls(
	fonts: FontConfigMap,
	globalOptions: GoogleFontGlobalOptions = {},
): string[] {
	const {
		display = 'swap',
		subsets = [
			'latin',
		],
		stripWhitespaceFromText = false,
	} = globalOptions;

	const urls: string[] = [];

	for (const [
		family,
		cfg,
	] of Object.entries(fonts)) {
		const fam = family?.trim();
		if (!fam) continue;

		const familyParam = encodeFamilyName(fam);
		const axisParam = buildAxisParam(cfg);

		// per-font subsets override → global → latin
		const chosenSubsets =
			cfg.subsets && cfg.subsets.length > 0
				? cfg.subsets
				: subsets.length > 0
					? subsets
					: [
							'latin',
						];
		const subsetParam = `&subset=${chosenSubsets.join(',')}`;

		const displayParam = `&display=${display}`;
		const textParam = buildTextParam(
			cfg.texts,
			stripWhitespaceFromText,
		);

		const url = `https://fonts.googleapis.com/css2?family=${familyParam}${axisParam}${subsetParam}${textParam}${displayParam}`;
		urls.push(url);
	}

	return urls;
}

/**
 * Convenience for SSR templates (string
 * of <link> tags)
 */
export function asLinkTags(urls: string[]): string {
	return urls
		.map((href) => `<link rel="stylesheet" href="${href}">`)
		.join('\n');
}

/**
 * Utility you can reuse in generators:
 * collapse strings → unique-char
 * string
 */
export function uniqueCharsFromStrings(
	input: string[],
	opts?: { stripWhitespace?: boolean },
): string {
	const joined = input.join('');
	const raw = opts?.stripWhitespace
		? joined.replace(/\s+/g, '')
		: joined;
	// NFC normalize to avoid duplicates caused by composed vs decomposed accents
	const nfc = raw.normalize('NFC');
	return Array.from(new Set(nfc)).join('');
}
