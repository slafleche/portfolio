import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { TokenizerAndRendererExtension, Tokens } from 'marked';

import { Abbr } from '@/components/Abbr';
import { abbrSlug, escapeHtml } from '@/lib/stringUtils';

const SHORTCODE_PATTERN = /^\[abbr:([^\]]+)\]/i;
const TOKEN_TYPE = 'abbr-shortcode';

export type AbbrLocaleEntry = {
	label?: string | null;
	definition?: string | null;
};

type AbbrToken = Tokens.Generic & {
	type: typeof TOKEN_TYPE;
	term: string;
	slug: string;
};

export type AbbrShortcodeExtensionOptions = {
	lookup: (slug: string) => AbbrLocaleEntry | undefined;
	onMissing?: (info: { slug: string; term: string }) => string | void;
	slugify?: (term: string) => string;
};

const sanitizeValue = (value: string | null | undefined) => {
	if (typeof value !== 'string') return '';
	return value.trim();
};

export const createAbbrShortcodeExtension = (
	options: AbbrShortcodeExtensionOptions,
): TokenizerAndRendererExtension => {
	const slugify = options.slugify ?? abbrSlug;
	const escapeInline = (value: string) =>
		escapeHtml(value, { convertLineBreaks: false });

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
			const entry = options.lookup(abbrToken.slug);

			const replacementFromMissing = () =>
				options.onMissing?.({
					slug: abbrToken.slug,
					term: abbrToken.term,
				});

			if (!entry) {
				return (
					replacementFromMissing() ?? escapeInline(abbrToken.term)
				);
			}

			const definition = sanitizeValue(entry.definition);
			if (!definition) {
				return (
					replacementFromMissing() ?? escapeInline(abbrToken.term)
				);
			}

			const label = sanitizeValue(entry.label ?? undefined);
			if (!label) {
				return escapeInline(definition);
			}

			return renderToStaticMarkup(
				createElement(Abbr, {
					label,
					definition,
				}),
			);
		},
	};
};
