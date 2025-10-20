import { memo } from 'react';
import type { ReactElement } from 'react';
import { marked } from 'marked';

type MarkdownProps = {
	id?: string;
	source: string;
	className?: string;
};

function MarkdownBase({
	id,
	source,
	className,
}: MarkdownProps): ReactElement {
	const html = marked.parse(source);
	return (
		<div
			id={id}
			className={className}
			dangerouslySetInnerHTML={{
				__html: typeof html === 'string' ? html : '',
			}}
		/>
	);
}

export const Markdown = memo(MarkdownBase);

Markdown.displayName = 'Markdown';
