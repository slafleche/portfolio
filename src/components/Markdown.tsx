import { createElement, memo } from 'react';
import type {
  ComponentPropsWithoutRef,
  ReactElement,
  JSX,
} from 'react';
import { marked, Renderer } from 'marked';
import { userContent } from '../styles/typography.css';
import { clsx } from 'clsx';

type MarkdownProps = {
  tag?: keyof JSX.IntrinsicElements;
  source?: string | null;
  openLinksInNewTab?: boolean;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

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
  source,
  openLinksInNewTab = true,
  tag,
  id,
  className,
  ...rest
}: MarkdownProps): ReactElement | null {
  const normalized =
    typeof source === 'string' ? normalizeSource(source) : '';

  if (normalized === '') {
    return null;
  }

  const html = marked.parse(normalized, {
    renderer: openLinksInNewTab
      ? createTargetBlankRenderer()
      : undefined,
  });

  if (typeof html !== 'string') {
    return null;
  }

  const Tag = tag ?? 'div';
  return createElement(Tag, {
    id,
    className: clsx(className, userContent),
    ...rest,
    dangerouslySetInnerHTML: { __html: html },
  });
}

export const Markdown = memo(MarkdownBase);

Markdown.displayName = 'Markdown';
