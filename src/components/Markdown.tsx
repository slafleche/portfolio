import { clsx } from 'clsx';
import { marked } from 'marked';
import type {
  ComponentPropsWithoutRef,
  JSX,
  ReactElement,
  ReactNode,
} from 'react';
import { createElement, memo } from 'react';

import CodeBlock from '@/components/CodeBlock';
import ExampleSites from '@/components/ExampleSites';
import MockCodeBlock from '@/components/MockCodeBlock';
import GitHubWordmark from '@/components/wordmarks/GitHubWordmark';
import NPMWordmark from '@/components/wordmarks/NPMWordmark';
import { enData } from '@/lib/locales/translations/en.data';
import { frData } from '@/lib/locales/translations/fr.data';
import { createBrShortcodeExtension } from '@/lib/markdown/brShortcode';
import { createElementShortcodeExtension } from '@/lib/markdown/elementShortcode';
import { createExampleSitesShortcodeExtension } from '@/lib/markdown/exampleSitesShortcode';
import { createMockCodeShortcodeExtension } from '@/lib/markdown/mockCodeShortcode';
import { sharedStrings } from '@/lib/sharedStrings';

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

type PerTagClassNames = {
  headings?: string;
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  h5?: string;
  h6?: string;
  paragraphs?: string;
  links?: string;
  listUnordered?: string;
  listOrdered?: string;
  blockquotes?: string;
  codeBlocks?: string;
};

type MarkdownProps = {
  tag?: keyof JSX.IntrinsicElements;
  children?: string | null;
  source?: string | null;
  openLinksInNewTab?: boolean;
  asUi?: AsUiConfig;
  classNameMap?: PerTagClassNames;
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
  variant?: string;
};

type BrShortcodeToken = {
  type: 'br-shortcode';
  count: number;
};

type ExampleSitesShortcodeToken = {
  type: 'example-sites-shortcode';
  locale: string;
};

type MockCodeShortcodeToken = {
  type: 'mock-code-shortcode';
  lang: string;
  text: string;
};

const isElementShortcodeToken = (
  token:
    | MarkedToken
    | ElementShortcodeToken
    | BrShortcodeToken
    | ExampleSitesShortcodeToken
    | MockCodeShortcodeToken,
): token is ElementShortcodeToken =>
  token.type === 'element-shortcode';

const isBrShortcodeToken = (
  token:
    | MarkedToken
    | ElementShortcodeToken
    | BrShortcodeToken
    | ExampleSitesShortcodeToken
    | MockCodeShortcodeToken,
): token is BrShortcodeToken => token.type === 'br-shortcode';

type RenderOptions = {
  openLinksInNewTab: boolean;
  asUi: AsUiConfig;
  classNameMap?: PerTagClassNames;
};

const defaultAsUi: Required<AsUiConfig> = {
  headings: false,
  paragraphs: false,
  links: false,
  listUnordered: false,
  listOrdered: false,
  blockquotes: false,
  codeBlocks: false,
};

const defaultMockCodeAsUi: Required<AsUiConfig> = {
  headings: true,
  paragraphs: true,
  links: false,
  listUnordered: true,
  listOrdered: true,
  blockquotes: true,
  codeBlocks: true,
};

const defaultClassNameMap: Required<PerTagClassNames> = {
  headings: '',
  h1: '',
  h2: '',
  h3: '',
  h4: '',
  h5: '',
  h6: '',
  paragraphs: '',
  links: '',
  listUnordered: '',
  listOrdered: '',
  blockquotes: '',
  codeBlocks: '',
};

const elementShortcodeExtension = createElementShortcodeExtension();
const brShortcodeExtension = createBrShortcodeExtension();
const exampleSitesShortcodeExtension =
  createExampleSitesShortcodeExtension();
const mockCodeShortcodeExtension = createMockCodeShortcodeExtension();
marked.use({
  extensions: [
    elementShortcodeExtension,
    brShortcodeExtension,
    exampleSitesShortcodeExtension,
    mockCodeShortcodeExtension,
  ],
});

const elementLookup = {
  GitHubWordmark,
  NPMWordmark,
} as const;

const getGitHubVariant = (variant?: string) => {
  const raw = (variant ?? '').trim().toLowerCase();
  if (raw === '')
    return { target: 'site' as const, locale: 'en' as const };

  const [
    targetRaw,
    localeRaw,
  ] = raw.split('-', 2);
  const target =
    targetRaw === 'csscalipers'
      ? ('csscalipers' as const)
      : ('site' as const);
  const locale =
    localeRaw === 'fr' ? ('fr' as const) : ('en' as const);
  return { target, locale };
};

const getLocaleStrings = (locale: 'en' | 'fr') =>
  locale === 'fr' ? frData : enData;

const getNpmLocale = (variant?: string): 'en' | 'fr' => {
  const raw = (variant ?? '').trim().toLowerCase();
  return raw === 'fr' ? 'fr' : 'en';
};

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

const parseDfnTitle = (raw: string): string | null => {
  const openTagMatch = raw.match(/^<dfn\b([^>]*)>$/i);
  if (!openTagMatch) return null;
  if (raw.endsWith('/>')) return null;

  const attrsChunk = openTagMatch[1] ?? '';
  const titleMatch = /\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(
    attrsChunk,
  );
  return titleMatch?.[1] ?? titleMatch?.[2] ?? null;
};

const isDfnClose = (raw: string) =>
  raw.trim().toLowerCase() === '</dfn>';

const inlineHtmlTagAllowList = new Set([
  'span',
]);

const parseDataAttributesChunk = (
  chunk: string,
): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const dataAttrRegex =
    /(data-[a-z0-9-]+)(?:=(?:"([^"]*)"|'([^']*)'))?/gi;
  let match: RegExpExecArray | null;
  while ((match = dataAttrRegex.exec(chunk))) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? 'true';
    attrs[key] = value;
  }
  return attrs;
};

const parseDataAttributes = (raw: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const attrMatch = raw.match(/^<([a-z0-9-]+)(\s[^>]*)?>$/i);
  if (!attrMatch?.[2]) return attrs;
  const attrChunk = attrMatch[2];
  return parseDataAttributesChunk(attrChunk);
};

const parseHeadingDataAttributesPrefix = (
  text: string,
): { dataAttrs: Record<string, string>; text: string } | null => {
  const match = text.match(/^\[([^\]]+)\]\s+(.*)$/);
  if (!match) return null;
  const [
    ,
    attrChunk,
    remainingText,
  ] = match;
  const dataAttrs = parseDataAttributesChunk(attrChunk);
  if (Object.keys(dataAttrs).length === 0) return null;
  if (remainingText.trim() === '') return null;
  return {
    dataAttrs,
    text: remainingText,
  };
};

const parseInlineHtmlOpenTag = (
  raw: string,
): { tagName: string; dataAttrs: Record<string, string> } | null => {
  const match = raw.match(/^<([a-z0-9-]+)(\s[^>]*)?>$/i);
  if (!match || raw.endsWith('/>')) return null;
  const tagName = match[1]?.toLowerCase() ?? '';
  if (!inlineHtmlTagAllowList.has(tagName)) return null;
  return {
    tagName,
    dataAttrs: parseDataAttributes(raw),
  };
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
  tokens: Array<
    MarkedToken | ElementShortcodeToken | BrShortcodeToken
  >,
  options: RenderOptions,
  keyPrefix: string,
  decodeEntities = false,
): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const asUi = { ...defaultAsUi, ...options.asUi };
  const classNameMap = {
    ...defaultClassNameMap,
    ...options.classNameMap,
  };

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (isElementShortcodeToken(token)) {
      const name = token.name as keyof typeof elementLookup;
      const Element = elementLookup[name];
      if (!Element) {
        nodes.push('');
        continue;
      }

      if (name === 'GitHubWordmark') {
        const { target, locale } = getGitHubVariant(token.variant);
        const linkUrl =
          target === 'csscalipers'
            ? sharedStrings.githubCSSCalipersUrl
            : sharedStrings.githubUrl;
        const strings = getLocaleStrings(locale);
        const linkLabel =
          target === 'csscalipers'
            ? strings['links-github-css-calipers-label']
            : strings['links-github-label'];
        nodes.push(
          <GitHubWordmark
            key={`${keyPrefix}-element-${i}`}
            linkUrl={linkUrl}
            linkLabel={linkLabel}
          />,
        );
        continue;
      }

      if (name === 'NPMWordmark') {
        const locale = getNpmLocale(token.variant);
        const strings = getLocaleStrings(locale);
        nodes.push(
          <NPMWordmark
            key={`${keyPrefix}-element-${i}`}
            linkUrl={sharedStrings.npmUrl}
            linkLabel={strings['links-npm-css-calipers-label']}
          />,
        );
        continue;
      }

      nodes.push(<Element key={`${keyPrefix}-element-${i}`} />);
      continue;
    }

    if (isBrShortcodeToken(token)) {
      for (let j = 0; j < token.count; j += 1) {
        nodes.push(
          <br key={`${keyPrefix}-br-shortcode-${i}-${j}`} />,
        );
      }
      continue;
    }

    if (token.type === 'html') {
      const raw = (token as { text?: string }).text ?? '';
      const abbrTitle = parseAbbrTitle(raw);
      if (abbrTitle) {
        const innerTokens: Array<
          MarkedToken | ElementShortcodeToken | BrShortcodeToken
        > = [];
        let closedIndex = -1;

        for (let j = i + 1; j < tokens.length; j += 1) {
          const next = tokens[j];
          if (next.type === 'html') {
            const nextRaw = (next as { text?: string }).text ?? '';
            if (isAbbrClose(nextRaw)) {
              closedIndex = j;
              break;
            }
          }
          innerTokens.push(next);
        }

        if (closedIndex !== -1) {
          nodes.push(
            <abbr key={`${keyPrefix}-abbr-${i}`} title={abbrTitle}>
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

      const dfnTitle = parseDfnTitle(raw);
      if (dfnTitle) {
        const innerTokens: Array<
          MarkedToken | ElementShortcodeToken | BrShortcodeToken
        > = [];
        let closedIndex = -1;

        for (let j = i + 1; j < tokens.length; j += 1) {
          const next = tokens[j];
          if (next.type === 'html') {
            const nextRaw = (next as { text?: string }).text ?? '';
            if (isDfnClose(nextRaw)) {
              closedIndex = j;
              break;
            }
          }
          innerTokens.push(next);
        }

        if (closedIndex !== -1) {
          nodes.push(
            <dfn key={`${keyPrefix}-dfn-${i}`} title={dfnTitle}>
              {renderInlineTokens(
                innerTokens,
                options,
                `${keyPrefix}-dfn-${i}`,
                true,
              )}
            </dfn>,
          );
          i = closedIndex;
          continue;
        }
      }

      const openTag = parseInlineHtmlOpenTag(raw);
      if (openTag) {
        const innerTokens: Array<
          MarkedToken | ElementShortcodeToken | BrShortcodeToken
        > = [];
        let closedIndex = -1;

        for (let j = i + 1; j < tokens.length; j += 1) {
          const next = tokens[j];
          if (next.type === 'html') {
            const nextRaw = (next as { text?: string }).text ?? '';
            if (
              parseInlineHtmlCloseTag(nextRaw) === openTag.tagName
            ) {
              closedIndex = j;
              break;
            }
          }
          innerTokens.push(next);
        }

        if (closedIndex !== -1) {
          const canReparseInline = innerTokens.every(
            (innerToken) =>
              innerToken.type === 'text' ||
              innerToken.type === 'space',
          );
          const inlineSource = canReparseInline
            ? innerTokens
                .map((innerToken) => {
                  if (innerToken.type === 'space') return ' ';
                  return (innerToken as { text?: string }).text ?? '';
                })
                .join('')
            : '';
          const shouldReparseInline =
            inlineSource !== '' &&
            (inlineSource.includes('[element:') ||
              inlineSource.toLowerCase().includes('[br'));

          nodes.push(
            createElement(
              openTag.tagName,
              {
                key: `${keyPrefix}-${openTag.tagName}-${i}`,
                ...openTag.dataAttrs,
              },
              shouldReparseInline
                ? renderInlineMarkdown(
                    inlineSource,
                    options,
                    `${keyPrefix}-${openTag.tagName}-${i}`,
                  )
                : renderInlineTokens(
                    innerTokens,
                    options,
                    `${keyPrefix}-${openTag.tagName}-${i}`,
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
          <code key={`${keyPrefix}-code-${i}`} data-code="inline">
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
        const dataUi = asUi.links ? 'link' : undefined;
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
          ...(linkToken.title ? { title: linkToken.title } : {}),
          ...(dataUi ? { 'data-ui': dataUi } : {}),
        };
        const isHashLink = safeHref.startsWith('#');
        if (options.openLinksInNewTab && !isHashLink) {
          linkProps.target = '_blank';
          linkProps.rel = 'noopener noreferrer';
        }
        nodes.push(
          <a
            key={`${keyPrefix}-link-${i}`}
            className={classNameMap.links}
            {...linkProps}
          >
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
            {...(imageToken.title ? { title: imageToken.title } : {})}
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
  const asUi = { ...defaultAsUi, ...options.asUi };
  const classNameMap = {
    ...defaultClassNameMap,
    ...options.classNameMap,
  };

  tokens.forEach((token, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (token.type) {
      case 'example-sites-shortcode': {
        const t = token as ExampleSitesShortcodeToken;
        nodes.push(
          <ExampleSites
            key={key}
            siteData={t.locale as 'en' | 'fr'}
          />,
        );
        break;
      }
      case 'mock-code-shortcode': {
        const t = token as MockCodeShortcodeToken;
        const innerNormalized = normalizeSource(t.text);
        const innerTokens =
          innerNormalized === ''
            ? []
            : (marked.lexer(innerNormalized) as MarkedToken[]);
        const innerOptions: RenderOptions = {
          ...options,
          asUi: defaultMockCodeAsUi,
        };

        nodes.push(
          <MockCodeBlock
            key={key}
            language={t.lang}
            {...getDataAttrs(token)}
          >
            {renderTokens(innerTokens, innerOptions, `${key}-mock`)}
          </MockCodeBlock>,
        );
        break;
      }
      case 'heading': {
        const depth = (token as { depth?: number }).depth ?? 1;
        const dataUi = asUi.headings ? 'heading' : undefined;
        const baseAttrs = getDataAttrs(token, dataUi);
        const headingTag = `h${depth}` as keyof JSX.IntrinsicElements;
        const headingClassName = clsx(
          classNameMap.headings,
          classNameMap[headingTag as keyof PerTagClassNames],
        );
        const parsedPrefix = parseHeadingDataAttributesPrefix(
          (token as { text?: string }).text ?? '',
        );
        const headingChildren = parsedPrefix
          ? renderInlineMarkdown(
              parsedPrefix.text,
              options,
              `${key}-heading`,
            )
          : renderInlineTokens(
              (token as { tokens?: MarkedToken[] }).tokens ?? [],
              options,
              `${key}-heading`,
            );
        const attrs = parsedPrefix
          ? { ...parsedPrefix.dataAttrs, ...baseAttrs }
          : baseAttrs;
        nodes.push(
          createElement(
            headingTag,
            { key, className: headingClassName, ...attrs },
            headingChildren,
          ),
        );
        break;
      }
      case 'paragraph': {
        const dataUi = asUi.paragraphs ? 'paragraph' : undefined;
        nodes.push(
          <p
            key={key}
            className={classNameMap.paragraphs}
            {...getDataAttrs(token, dataUi)}
          >
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
        const dataUi = asUi.paragraphs ? 'paragraph' : undefined;
        nodes.push(
          <p
            key={key}
            className={classNameMap.paragraphs}
            {...getDataAttrs(token, dataUi)}
          >
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
          ? asUi.listOrdered
            ? 'list-ordered'
            : undefined
          : asUi.listUnordered
            ? 'list-unordered'
            : undefined;
        const Tag = listToken.ordered ? 'ol' : 'ul';
        const listClassName = listToken.ordered
          ? classNameMap.listOrdered
          : classNameMap.listUnordered;
        nodes.push(
          <Tag
            key={key}
            className={listClassName}
            {...getDataAttrs(token, dataUi)}
          >
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
        const dataUi = asUi.blockquotes ? 'blockquote' : undefined;
        nodes.push(
          <blockquote
            key={key}
            className={classNameMap.blockquotes}
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
        const dataUi = asUi.codeBlocks ? 'code-block' : undefined;
        const codeToken = token as {
          text?: string;
          lang?: string;
        };
        const text = codeToken.text ?? '';
        nodes.push(
          <CodeBlock
            key={key}
            code={text}
            language={codeToken.lang}
            className={classNameMap.codeBlocks}
            {...getDataAttrs(token, dataUi)}
          />,
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
        nodes.push(<hr key={key} {...getDataAttrs(token)} />);
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
  children,
  source,
  openLinksInNewTab = true,
  tag,
  id,
  className,
  asUi = {},
  classNameMap = {},
  ...rest
}: MarkdownProps): ReactElement | null {
  const effectiveSource =
    typeof children === 'string'
      ? children
      : typeof source === 'string'
        ? source
        : '';
  const normalized =
    effectiveSource === '' ? '' : normalizeSource(effectiveSource);
  const tokens = normalized === '' ? [] : marked.lexer(normalized);
  if (tokens.length === 0) {
    return null;
  }

  const content = renderTokens(
    tokens as MarkedToken[],
    {
      openLinksInNewTab,
      asUi,
      classNameMap: { ...defaultClassNameMap, ...classNameMap },
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
