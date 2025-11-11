import { memo } from 'react';
import type { ReactElement } from 'react';
import { Marked, Renderer } from 'marked';
import { createLocaleAbbrExtension } from '@/lib/markdown/abbrShortcode';
import type { AbbrLocaleEntry } from '@/lib/locales/translations/abbrRenderer';

type MarkdownProps = {
	id?: string;
	source?: string | null;
	className?: string;
	openLinksInNewTab?: boolean;
	locale?: string;
	abbrEntries?: Record<string, AbbrLocaleEntry>;
};

const createTargetBlankRenderer = () => {
	const renderer = new Renderer();
	renderer.link = function ({ href, title, tokens }) {
		const safeHref = href ?? '';
		const titleAttr = title ? ` title="${title}"` : '';
		const content = this.parser.parseInline(tokens ?? []);
		return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${content}</a>`;
	};
	return renderer;
};

function MarkdownBase({
	id,
	source,
	className,
	openLinksInNewTab = true,
	locale,
	abbrEntries,
}: MarkdownProps): ReactElement | null {
	if (typeof source !== 'string' || source.trim() === '') {
		return null;
	}

	const parser = new Marked({
		renderer: openLinksInNewTab ? createTargetBlankRenderer() : undefined,
	});

	if (locale && abbrEntries) {
		parser.use(createLocaleAbbrExtension(locale, abbrEntries));
	}

	const parsed = parser.parse(source);
	const html = typeof parsed === 'string' ? parsed : '';

	return (
		<div
			id={id}
			className={className}
			dangerouslySetInnerHTML={{
				__html: html,
			}}
		/>
	);
}

export const Markdown = memo(MarkdownBase);

Markdown.displayName = 'Markdown';
