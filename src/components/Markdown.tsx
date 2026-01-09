import { clsx } from 'clsx';
import { marked, Renderer } from 'marked';
import type {
  ComponentPropsWithoutRef,
  JSX,
  ReactElement,
} from 'react';
import { createElement, memo } from 'react';

import { userContent } from '../styles/typography.css';

type AsUiConfig = {
  headings?: boolean;
  paragraphs?: boolean;
  links?: boolean;
  listUnordered?: boolean;
  listOrdered?: boolean;
  blockquotes?: boolean;
  codeBlocks?: boolean;
};

type MarkdownProps = {
  tag?: keyof JSX.IntrinsicElements;
  source?: string | null;
  openLinksInNewTab?: boolean;
  asUi?: AsUiConfig;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

type MarkedToken = {
  type: string;
  ordered?: boolean;
  dataFirst?: boolean;
  dataLast?: boolean;
  dataUi?: string;
};

const isRenderableToken = (token: MarkedToken): boolean =>
  token.type !== 'space' && token.type !== 'def';

const markFirstLastTokens = (tokens: MarkedToken[]) => {
  const renderable = tokens.filter(isRenderableToken);
  const first = renderable[0];
  const last = renderable[renderable.length - 1];
  if (first) first.dataFirst = true;
  if (last) last.dataLast = true;
};

const getDataAttrs = (token: MarkedToken): string => {
  const attrs: string[] = [];
  if (token.dataFirst) attrs.push('data-first="true"');
  if (token.dataLast) attrs.push('data-last="true"');
  if (token.dataUi) attrs.push(`data-ui="${token.dataUi}"`);
  return attrs.join(' ');
};

const injectDataAttrs = (
  html: string,
  token: MarkedToken,
): string => {
  const attrs = getDataAttrs(token);
  if (!attrs) return html;
  return html.replace(/^\s*<([a-z0-9-]+)([^>]*)>/i, (
    match: string,
    tag: string,
    rest: string,
  ) => {
    const leading = match.match(/^\s*/)?.[0] ?? '';
    const normalizedRest = rest ?? '';
    const spacer =
      normalizedRest === ''
        ? ' '
        : normalizedRest.endsWith(' ')
          ? ''
          : ' ';
    return `${leading}<${tag}${normalizedRest}${spacer}${attrs}>`;
  });
};

const createMarkdownRenderer = (
  openLinksInNewTab: boolean,
  asUi: AsUiConfig,
) => {
  const renderer = new Renderer();

  type RendererMethod =
    | 'paragraph'
    | 'heading'
    | 'list'
    | 'blockquote'
    | 'code'
    | 'table'
    | 'hr';

  const applyUi = (method: RendererMethod, token: MarkedToken) => {
    switch (method) {
      case 'heading':
        if (asUi.headings) {
          token.dataUi = 'heading';
        }
        break;
      case 'paragraph':
        if (asUi.paragraphs) {
          token.dataUi = 'paragraph';
        }
        break;
      case 'list':
        if (token.ordered && asUi.listOrdered) {
          token.dataUi = 'list-ordered';
        }
        if (!token.ordered && asUi.listUnordered) {
          token.dataUi = 'list-unordered';
        }
        break;
      case 'blockquote':
        if (asUi.blockquotes) {
          token.dataUi = 'blockquote';
        }
        break;
      case 'code':
        if (asUi.codeBlocks) {
          token.dataUi = 'code-block';
        }
        break;
      default:
        break;
    }
  };

  if (openLinksInNewTab || asUi.links) {
    renderer.link = function ({ href, title, tokens }) {
      const safeHref = href ?? '';
      const titleAttr = title ? ` title="${title}"` : '';
      const dataUiAttr = asUi.links ? ' data-ui="link"' : '';
      const targetAttrs = openLinksInNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      const content = this.parser.parseInline(tokens ?? []);
      return `<a href="${safeHref}"${titleAttr}${dataUiAttr}${targetAttrs}>${content}</a>`;
    };
  }

  const wrap = (method: RendererMethod) =>
    function (this: Renderer, token: MarkedToken) {
      applyUi(method, token);
      const baseRender = Renderer.prototype[method] as (
        this: Renderer,
        token: MarkedToken,
      ) => string;
      const html = baseRender.call(this, token);
      return injectDataAttrs(html, token);
    };

  renderer.paragraph = wrap('paragraph');
  renderer.heading = wrap('heading');
  renderer.list = wrap('list');
  renderer.blockquote = wrap('blockquote');
  renderer.code = wrap('code');
  renderer.table = wrap('table');
  renderer.hr = wrap('hr');

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
  asUi = {},
  ...rest
}: MarkdownProps): ReactElement | null {
  const normalized =
    typeof source === 'string' ? normalizeSource(source) : '';
  const tokens = normalized === '' ? [] : marked.lexer(normalized);
  markFirstLastTokens(tokens as MarkedToken[]);
  const html =
    normalized === ''
      ? ''
      : marked.parser(tokens, {
          renderer: createMarkdownRenderer(openLinksInNewTab, asUi),
        });

  if (typeof html !== 'string') {
    return null;
  }

  if (html === '') {
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
