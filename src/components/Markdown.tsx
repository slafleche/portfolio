import { memo } from 'react';
import type { ReactElement } from 'react';
import { marked, Renderer } from 'marked';

type MarkdownProps = {
  id?: string;
  source?: string | null;
  className?: string;
  openLinksInNewTab?: boolean;
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
}: MarkdownProps): ReactElement | null {
  const trimmed = typeof source === 'string' ? source.trim() : '';
  if (trimmed === '') {
    return null;
  }

  const html = openLinksInNewTab
    ? marked.parse(trimmed, { renderer: createTargetBlankRenderer() })
    : marked.parse(trimmed);
  const sanitizedHtml =
    typeof html === 'string'
      ? html.replace(/<div>\s*<\/div>/g, '')
      : '';

  return (
    <div
      id={id}
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
}

export const Markdown = memo(MarkdownBase);

Markdown.displayName = 'Markdown';
