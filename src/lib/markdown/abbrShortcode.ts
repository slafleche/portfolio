import type {
	RendererExtension,
	TokenizerExtension,
	Tokens,
} from 'marked';

import type {
	AbbrLocaleEntry,
	AbbrLookup,
} from '@/lib/locales/translations/abbrRenderer';
import { renderAbbreviation } from '@/lib/locales/translations/abbrRenderer';
import { abbrSlug } from '@/lib/stringUtils';

const SHORTCODE_PATTERN = /^\[abbr:([^\]]+)\]/i;
const TOKEN_TYPE = 'abbr-shortcode';

type AbbrToken = Tokens.Generic & {
	type: typeof TOKEN_TYPE;
	term: string;
	slug: string;
};

export type AbbrShortcodeExtensionOptions = {
	lookup: AbbrLookup;
	locale: string;
	slugify?: (term: string) => string;
};

const sanitizeValue = (value: string | null | undefined) => {
	if (typeof value !== 'string') return '';
	return value.trim();
};

type AbbrShortcodeExtension = TokenizerExtension & RendererExtension;

export const createAbbrShortcodeExtension = (
	options: AbbrShortcodeExtensionOptions,
): AbbrShortcodeExtension => {
	const slugify = options.slugify ?? abbrSlug;

	return {
		name: TOKEN_TYPE,
		level: 'inline',
		start(src) {
			const index = src.indexOf('[abbr:');
			return index >= 0 ? index : undefined;
		},
		tokenizer(src) {
			const match = SHORTCODE_PATTERN.exec(src);
			if (!match) return undefined;

			const term = sanitizeValue(match[1]);
			if (!term) return undefined;

			return {
				type: TOKEN_TYPE,
				raw: match[0],
				term,
				slug: slugify(term),
			} satisfies AbbrToken;
		},
		renderer(token) {
			if (token.type !== TOKEN_TYPE) return undefined;

			const abbrToken = token as AbbrToken;
			return renderAbbreviation({
				locale: options.locale,
				term: abbrToken.term,
				lookup: options.lookup,
				slugify,
			});
		},
	} satisfies AbbrShortcodeExtension;
};

export const createLocaleAbbrExtension = (
	locale: string,
	entries: Record<string, AbbrLocaleEntry>,
) =>
	createAbbrShortcodeExtension({
		locale,
		lookup: (slug) => entries[slug],
	});
