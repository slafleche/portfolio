import { abbrSlug, escapeHtml } from '@/lib/stringUtils';

export type AbbrLocaleEntry = {
	label?: string | null;
	definition?: string | null;
};

const sanitize = (value: string | null | undefined) =>
	typeof value === 'string' ? value.trim() : '';

const renderFallback = (value: string) =>
	escapeHtml(value, { convertLineBreaks: false });

const renderAbbrHtml = (label: string, definition: string) => {
	const safeLabel = escapeHtml(label, { convertLineBreaks: false });
	const safeDefinition = escapeHtml(definition, {
		convertLineBreaks: false,
	});
	return `<abbr title="${safeDefinition}">${safeLabel}</abbr>`;
};

export type AbbrLookup = (slug: string) => AbbrLocaleEntry | undefined;

type RenderOptions = {
	locale: string;
	term: string;
	lookup: AbbrLookup;
	slugify?: (value: string) => string;
};

export const renderAbbreviation = ({
	locale,
	term,
	lookup,
	slugify = abbrSlug,
}: RenderOptions) => {
	const normalized = sanitize(term);
	if (!normalized) return '';

	const slug = slugify(normalized);
	const entry = lookup(slug);
	const definition = sanitize(entry?.definition);

	if (!entry || !definition) {
		if (process.env.NODE_ENV !== 'production') {
			throw new Error(
				`[locales][${locale}] Missing abbreviation definition for slug "${slug}".`,
			);
		}
		return renderFallback(normalized);
	}

	const label = sanitize(entry.label);
	if (!label) {
		return renderFallback(definition);
	}

	return renderAbbrHtml(label, definition);
};
