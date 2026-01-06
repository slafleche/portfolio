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

const normalizeSource = (source: string): string => {
  const lines = source
    .split(/\r?\n/)
    .map((line) => (line.trim() === '' ? '' : line));

  const collapsed: string[] = [];
  let previousBlank = false;
  let inFencedBlock = false;

  for (const line of lines) {
    const isFence = /^\s*(```|~~~)/.test(line);
    if (isFence) {
      inFencedBlock = !inFencedBlock;
      collapsed.push(line);
      previousBlank = false;
      continue;
    }

    if (inFencedBlock) {
      collapsed.push(line);
      previousBlank = false;
      continue;
    }

    const isBlank = line === '';
    if (isBlank && previousBlank) {
      continue;
    }
    collapsed.push(line);
    previousBlank = isBlank;
  }

  return collapsed.join('\n').trim();
};

function MarkdownBase({
  id,
  source,
  className,
  openLinksInNewTab = true,
}: MarkdownProps): ReactElement | null {
  const normalized = typeof source === 'string' ? normalizeSource(source) : '';
  if (normalized === '') {
    return null;
  }

  const html = marked.parse(normalized, {
    renderer: openLinksInNewTab ? createTargetBlankRenderer() : undefined,
  });

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
