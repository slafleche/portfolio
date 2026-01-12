import { clsx } from 'clsx';
import { marked } from 'marked';
import type {
  ComponentPropsWithoutRef,
  JSX,
  ReactElement,
  ReactNode,
} from 'react';
import { createElement, memo } from 'react';

import GitHubWordmark from '@/components/wordmarks/GitHubWordmark';
import NPMWordmark from '@/components/wordmarks/NPMWordmark';
import { createElementShortcodeExtension } from '@/lib/markdown/elementShortcode';

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

type ElementShortcodeToken = {
  type: 'element-shortcode';
  name: string;
};

const isElementShortcodeToken = (
  token: MarkedToken | ElementShortcodeToken,
): token is ElementShortcodeToken =>
  token.type === 'element-shortcode';

type RenderOptions = {
  openLinksInNewTab: boolean;
  asUi: AsUiConfig;
};

const elementShortcodeExtension = createElementShortcodeExtension();
marked.use({ extensions: [elementShortcodeExtension] });

const elementLookup = {
  GitHubWordmark,
  NPMWordmark,
} as const;

const sanitizeHref = (href?: string) => {
  if (!href) return '';
  const trimmed = href.trim();
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'mailto:' ||
      parsed.protocol === 'tel:'
    ) {
      return trimmed;
    }
  } catch {
    return '';
  }
  return '';
};

const getDataAttrs = (
  token: MarkedToken,
  dataUi?: string,
): Record<string, string> => {
  const attrs: Record<string, string> = {};
  if (token.dataFirst) attrs['data-first'] = 'true';
  if (token.dataLast) attrs['data-last'] = 'true';
  if (dataUi) attrs['data-ui'] = dataUi;
  return attrs;
};

const parseAbbrTitle = (raw: string): string | null => {
  const match = raw.match(/^<abbr\s+title="([^"]*)">$/i);
  return match?.[1] ?? null;
};

const isAbbrClose = (raw: string) =>
  raw.trim().toLowerCase() === '</abbr>';

const inlineHtmlTagAllowList = new Set(['span']);

const parseInlineHtmlOpenTag = (raw: string): string | null => {
  const match = raw.match(/^<([a-z0-9-]+)(\s[^>]*)?>$/i);
  if (!match || raw.endsWith('/>')) return null;
  const tagName = match[1]?.toLowerCase() ?? '';
  return inlineHtmlTagAllowList.has(tagName) ? tagName : null;
};

const parseInlineHtmlCloseTag = (raw: string): string | null => {
  const match = raw.match(/^<\/([a-z0-9-]+)>$/i);
  if (!match) return null;
  const tagName = match[1]?.toLowerCase() ?? '';
  return inlineHtmlTagAllowList.has(tagName) ? tagName : null;
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const renderInlineTokens = (
  tokens: Array<MarkedToken | ElementShortcodeToken>,
  options: RenderOptions,
  keyPrefix: string,
  decodeEntities = false,
): ReactNode[] => {
  const nodes: ReactNode[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (isElementShortcodeToken(token)) {
      const Element =
        elementLookup[
          token.name as keyof typeof elementLookup
        ];
      if (!Element) {
        nodes.push('');
        continue;
      }
      nodes.push(
        <Element key={`${keyPrefix}-element-${i}`} />,
      );
      continue;
    }

    if (token.type === 'html') {
      const raw = (token as { text?: string }).text ?? '';
      const abbrTitle = parseAbbrTitle(raw);
      if (abbrTitle) {
        const innerTokens: Array<
          MarkedToken | ElementShortcodeToken
        > = [];
        let closedIndex = -1;

        for (let j = i + 1; j < tokens.length; j += 1) {
          const next = tokens[j];
          if (next.type === 'html') {
            const nextRaw =
              (next as { text?: string }).text ?? '';
            if (isAbbrClose(nextRaw)) {
              closedIndex = j;
              break;
            }
          }
          innerTokens.push(next);
        }

        if (closedIndex !== -1) {
          nodes.push(
            <abbr
              key={`${keyPrefix}-abbr-${i}`}
              title={abbrTitle}
            >
              {renderInlineTokens(
                innerTokens,
                options,
                `${keyPrefix}-abbr-${i}`,
                true,
              )}
            </abbr>,
          );
          i = closedIndex;
          continue;
        }
      }

      const openTag = parseInlineHtmlOpenTag(raw);
      if (openTag) {
        const innerTokens: Array<
          MarkedToken | ElementShortcodeToken
        > = [];
        let closedIndex = -1;

        for (let j = i + 1; j < tokens.length; j += 1) {
          const next = tokens[j];
          if (next.type === 'html') {
            const nextRaw =
              (next as { text?: string }).text ?? '';
            if (parseInlineHtmlCloseTag(nextRaw) === openTag) {
              closedIndex = j;
              break;
            }
          }
          innerTokens.push(next);
        }

        if (closedIndex !== -1) {
          nodes.push(
            createElement(
              openTag,
              { key: `${keyPrefix}-${openTag}-${i}` },
              renderInlineTokens(
                innerTokens,
                options,
                `${keyPrefix}-${openTag}-${i}`,
                true,
              ),
            ),
          );
          i = closedIndex;
          continue;
        }
      }

      nodes.push(raw);
      continue;
    }

    switch (token.type) {
      case 'text': {
        const textToken = token as {
          text?: string;
          tokens?: Array<MarkedToken | ElementShortcodeToken>;
        };
        if (textToken.tokens?.length) {
          nodes.push(
            ...renderInlineTokens(
              textToken.tokens,
              options,
              `${keyPrefix}-text-${i}`,
              decodeEntities,
            ),
          );
          break;
        }
        const textValue = textToken.text ?? '';
        nodes.push(
          decodeEntities ? decodeHtmlEntities(textValue) : textValue,
        );
        break;
      }
      case 'strong': {
        const strongToken = token as {
          tokens?: Array<MarkedToken | ElementShortcodeToken>;
        };
        nodes.push(
          <strong key={`${keyPrefix}-strong-${i}`}>
            {renderInlineTokens(
              strongToken.tokens ?? [],
              options,
              `${keyPrefix}-strong-${i}`,
            )}
          </strong>,
        );
        break;
      }
      case 'em': {
        const emToken = token as {
          tokens?: Array<MarkedToken | ElementShortcodeToken>;
        };
        nodes.push(
          <em key={`${keyPrefix}-em-${i}`}>
            {renderInlineTokens(
              emToken.tokens ?? [],
              options,
              `${keyPrefix}-em-${i}`,
            )}
          </em>,
        );
        break;
      }
      case 'codespan': {
        const codeToken = token as { text?: string };
        nodes.push(
          <code key={`${keyPrefix}-code-${i}`}>
            {codeToken.text ?? ''}
          </code>,
        );
        break;
      }
      case 'link': {
        const linkToken = token as {
          href?: string;
          title?: string | null;
          tokens?: Array<MarkedToken | ElementShortcodeToken>;
        };
        const dataUi = options.asUi.links ? 'link' : undefined;
        const safeHref = sanitizeHref(linkToken.href);
        if (!safeHref) {
          nodes.push(
            ...renderInlineTokens(
              linkToken.tokens ?? [],
              options,
              `${keyPrefix}-link-${i}-text`,
            ),
          );
          break;
        }
        const linkProps: Record<string, string> = {
          href: safeHref,
          ...(linkToken.title
            ? { title: linkToken.title }
            : {}),
          ...(dataUi ? { 'data-ui': dataUi } : {}),
        };
        if (options.openLinksInNewTab) {
          linkProps.target = '_blank';
          linkProps.rel = 'noopener noreferrer';
        }
        nodes.push(
          <a key={`${keyPrefix}-link-${i}`} {...linkProps}>
            {renderInlineTokens(
              linkToken.tokens ?? [],
              options,
              `${keyPrefix}-link-${i}`,
            )}
          </a>,
        );
        break;
      }
      case 'br':
        nodes.push(<br key={`${keyPrefix}-br-${i}`} />);
        break;
      case 'del': {
        const delToken = token as {
          tokens?: Array<MarkedToken | ElementShortcodeToken>;
        };
        nodes.push(
          <del key={`${keyPrefix}-del-${i}`}>
            {renderInlineTokens(
              delToken.tokens ?? [],
              options,
              `${keyPrefix}-del-${i}`,
            )}
          </del>,
        );
        break;
      }
      case 'image': {
        const imageToken = token as {
          href?: string;
          title?: string | null;
          text?: string;
        };
        nodes.push(
          <img
            key={`${keyPrefix}-img-${i}`}
            src={imageToken.href ?? ''}
            alt={imageToken.text ?? ''}
            {...(imageToken.title
              ? { title: imageToken.title }
              : {})}
          />,
        );
        break;
      }
      default:
        nodes.push('');
        break;
    }
  }

  return nodes;
};

const renderTokens = (
  tokens: MarkedToken[],
  options: RenderOptions,
  keyPrefix: string,
): ReactNode[] => {
  markFirstLastTokens(tokens);
  const nodes: ReactNode[] = [];

  tokens.forEach((token, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (token.type) {
      case 'heading': {
        const depth = (token as { depth?: number }).depth ?? 1;
        const dataUi = options.asUi.headings
          ? 'heading'
          : undefined;
        const attrs = getDataAttrs(token, dataUi);
        nodes.push(
          createElement(
            `h${depth}` as keyof JSX.IntrinsicElements,
            { key, ...attrs },
            renderInlineTokens(
              (token as { tokens?: MarkedToken[] }).tokens ?? [],
              options,
              `${key}-heading`,
            ),
          ),
        );
        break;
      }
      case 'paragraph': {
        const dataUi = options.asUi.paragraphs
          ? 'paragraph'
          : undefined;
        nodes.push(
          <p key={key} {...getDataAttrs(token, dataUi)}>
            {renderInlineTokens(
              (token as { tokens?: MarkedToken[] }).tokens ?? [],
              options,
              `${key}-paragraph`,
            )}
          </p>,
        );
        break;
      }
      case 'text': {
        const dataUi = options.asUi.paragraphs
          ? 'paragraph'
          : undefined;
        nodes.push(
          <p key={key} {...getDataAttrs(token, dataUi)}>
            {renderInlineTokens(
              (token as { tokens?: MarkedToken[] }).tokens ?? [],
              options,
              `${key}-text`,
            )}
          </p>,
        );
        break;
      }
      case 'list': {
        const listToken = token as {
          ordered?: boolean;
          items?: Array<{
            tokens?: MarkedToken[];
          }>;
        };
        const dataUi = listToken.ordered
          ? options.asUi.listOrdered
            ? 'list-ordered'
            : undefined
          : options.asUi.listUnordered
            ? 'list-unordered'
            : undefined;
        const Tag = listToken.ordered ? 'ol' : 'ul';
        nodes.push(
          <Tag key={key} {...getDataAttrs(token, dataUi)}>
            {(listToken.items ?? []).map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>
                {renderInlineTokens(
                  item.tokens ?? [],
                  options,
                  `${key}-item-${itemIndex}`,
                )}
              </li>
            ))}
          </Tag>,
        );
        break;
      }
      case 'blockquote': {
        const dataUi = options.asUi.blockquotes
          ? 'blockquote'
          : undefined;
        nodes.push(
          <blockquote
            key={key}
            {...getDataAttrs(token, dataUi)}
          >
            {renderTokens(
              (token as { tokens?: MarkedToken[] }).tokens ?? [],
              options,
              `${key}-blockquote`,
            )}
          </blockquote>,
        );
        break;
      }
      case 'code': {
        const dataUi = options.asUi.codeBlocks
          ? 'code-block'
          : undefined;
        const text = (token as { text?: string }).text ?? '';
        nodes.push(
          <pre key={key} {...getDataAttrs(token, dataUi)}>
            <code>{text}</code>
          </pre>,
        );
        break;
      }
      case 'table': {
        const tableToken = token as {
          header?: MarkedToken[][];
          rows?: MarkedToken[][][];
        };
        nodes.push(
          <table key={key} {...getDataAttrs(token)}>
            <thead>
              <tr>
                {(tableToken.header ?? []).map(
                  (cellTokens, cellIndex) => (
                    <th key={`${key}-th-${cellIndex}`}>
                      {renderInlineTokens(
                        cellTokens,
                        options,
                        `${key}-th-${cellIndex}`,
                      )}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {(tableToken.rows ?? []).map((row, rowIndex) => (
                <tr key={`${key}-tr-${rowIndex}`}>
                  {row.map((cellTokens, cellIndex) => (
                    <td key={`${key}-td-${rowIndex}-${cellIndex}`}>
                      {renderInlineTokens(
                        cellTokens,
                        options,
                        `${key}-td-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>,
        );
        break;
      }
      case 'hr':
        nodes.push(
          <hr key={key} {...getDataAttrs(token)} />,
        );
        break;
      case 'space':
        break;
      default:
        break;
    }
  });

  return nodes;
};

export const renderInlineMarkdown = (
  source: string,
  options: RenderOptions,
  keyPrefix = 'inline',
): ReactNode[] => {
  const normalized = normalizeSource(source);
  const tokens = normalized === '' ? [] : marked.lexer(normalized);
  if (tokens.length === 0) {
    return [];
  }

  if (
    tokens.length === 1 &&
    (tokens[0].type === 'paragraph' || tokens[0].type === 'text')
  ) {
    return renderInlineTokens(
      (tokens[0] as { tokens?: MarkedToken[] }).tokens ?? [],
      options,
      keyPrefix,
    );
  }

  return renderTokens(tokens as MarkedToken[], options, keyPrefix);
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
  if (tokens.length === 0) {
    return null;
  }

  const content = renderTokens(
    tokens as MarkedToken[],
    {
      openLinksInNewTab,
      asUi,
    },
    'md',
  );

  const Tag = tag ?? 'div';
  return createElement(
    Tag,
    {
      id,
      className: clsx(className, userContent),
      ...rest,
    },
    content,
  );
}

export const Markdown = memo(MarkdownBase);

Markdown.displayName = 'Markdown';
