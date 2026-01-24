import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Markdown } from '@/components/Markdown';
import { enData } from '@/lib/locales/translations/en.data';
import { frData } from '@/lib/locales/translations/fr.data';
import { sharedStrings } from '@/lib/sharedStrings';

describe('Markdown component', () => {
  it('renders anchors with target and rel when openLinksInNewTab is true', () => {
    render(<Markdown source="[Docs](https://example.com)" />);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('omits target attributes when disabled', () => {
    render(
      <Markdown
        source="[Docs](https://example.com)"
        openLinksInNewTab={false}
      />,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).not.toHaveAttribute('target');
  });

  it('does not open hash links in a new tab (anchors should scroll)', () => {
    render(<Markdown source="[CSS Calipers](#css-calipers)" />);
    const link = screen.getByRole('link', { name: 'CSS Calipers' });
    expect(link).toHaveAttribute('href', '#css-calipers');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('returns null when source is empty or whitespace', () => {
    const { container } = render(<Markdown source="   " />);
    expect(container).toBeEmptyDOMElement();
  });

  it('trims leading and trailing whitespace before parsing', () => {
    const { container } = render(<Markdown source="  Hello  " />);
    expect(container.textContent?.trim()).toBe('Hello');
  });

  it('does not render empty paragraphs from repeated blank lines', () => {
    const { container } = render(
      <Markdown source={'First\n\n\n\nSecond'} />,
    );
    const markdownRoot = container.firstElementChild;
    const emptyParagraphs = markdownRoot
      ? Array.from(markdownRoot.querySelectorAll('p')).filter(
          (node) => node.textContent?.trim() === '',
        )
      : [];
    expect(emptyParagraphs).toHaveLength(0);
  });

  it('prevents empty paragraphs from whitespace-only spacing', () => {
    const { container } = render(
      <Markdown source={'One\n\n \n\t\n\nTwo'} />,
    );
    const markdownRoot = container.firstElementChild;
    const emptyParagraphs = markdownRoot
      ? Array.from(markdownRoot.querySelectorAll('p')).filter(
          (node) => node.textContent?.trim() === '',
        )
      : [];
    expect(emptyParagraphs).toHaveLength(0);
  });

  it('treats whitespace-only lines as blank and collapses them', () => {
    const { container } = render(
      <Markdown source={'First\n \t \n\t\nSecond'} />,
    );
    const markdownRoot = container.firstElementChild;
    const paragraphs = markdownRoot
      ? Array.from(markdownRoot.querySelectorAll('p'))
      : [];
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.textContent?.trim()).toBe('First');
    expect(paragraphs[1]?.textContent?.trim()).toBe('Second');
  });

  it('handles Windows newlines when normalizing blank lines', () => {
    const { container } = render(
      <Markdown source={'First\r\n\r\n\r\nSecond'} />,
    );
    const markdownRoot = container.firstElementChild;
    const paragraphs = markdownRoot
      ? Array.from(markdownRoot.querySelectorAll('p'))
      : [];
    expect(paragraphs).toHaveLength(2);
  });

  it('keeps a single blank line between paragraphs', () => {
    const { container } = render(
      <Markdown source={'Alpha\n\nBeta'} />,
    );
    const markdownRoot = container.firstElementChild;
    const paragraphs = markdownRoot
      ? Array.from(markdownRoot.querySelectorAll('p'))
      : [];
    expect(paragraphs).toHaveLength(2);
  });

  it('does not strip inline HTML content', () => {
    const { container } = render(
      <Markdown source={'Hello <span>world</span>!\n\nNext'} />,
    );
    const span = container.querySelector('span');
    expect(span?.textContent).toBe('world');
  });

  it('preserves data attributes on allowed inline HTML tags', () => {
    const { container } = render(
      <Markdown
        source={
          'Hello <span data-foo="bar" data-flag>world</span>!'
        }
      />,
    );
    const span = container.querySelector('span');
    expect(span?.getAttribute('data-foo')).toBe('bar');
    expect(span?.getAttribute('data-flag')).toBe('true');
  });

  it('renders dfn tags with titles from inline HTML', () => {
    const { container } = render(
      <Markdown
        source={
          'A <dfn title="A short definition">term</dfn> in a sentence.'
        }
      />,
    );

    const dfn = container.querySelector('dfn');
    expect(dfn).toBeTruthy();
    expect(dfn?.getAttribute('title')).toBe('A short definition');
    expect(dfn?.textContent).toBe('term');
  });

  it('supports data attributes on headings via bracket prefix', () => {
    const { container } = render(
      <Markdown
        source={
          '### [data-align="center" data-foo="bar" data-flag] A heading'
        }
      />,
    );
    const heading = container.querySelector('h3');
    expect(heading?.getAttribute('data-align')).toBe('center');
    expect(heading?.getAttribute('data-foo')).toBe('bar');
    expect(heading?.getAttribute('data-flag')).toBe('true');
    expect(heading?.textContent).toBe('A heading');
  });

  it('renders element shortcodes inside inline spans', () => {
    const { container } = render(
      <Markdown
        source={
          'Hello <span data-wrap="no">[element:NPMWordmark]!</span>'
        }
      />,
    );
    const span = container.querySelector('span');
    const svg = span?.querySelector(
      'svg[aria-label="Node Package Manager (NPM)"]',
    );
    expect(svg).not.toBeNull();
  });

  it('drops non-data attributes on allowed inline HTML tags', () => {
    const { container } = render(
      <Markdown
        source={
          'Hello <span class="x" style="color:red" data-ok="y">world</span>!'
        }
      />,
    );
    const span = container.querySelector('span');
    expect(span?.getAttribute('class')).toBeNull();
    expect(span?.getAttribute('style')).toBeNull();
    expect(span?.getAttribute('data-ok')).toBe('y');
  });

  it('renders abbr tags and decodes HTML entities inside', () => {
    const { container } = render(
      <Markdown
        source={
          'Moving to <abbr title="Research and Development">R&amp;D</abbr>.'
        }
      />,
    );
    const abbr = container.querySelector('abbr');
    expect(abbr?.getAttribute('title')).toBe(
      'Research and Development',
    );
    expect(abbr?.textContent).toBe('R&D');
  });

  it('renders element shortcodes from the allowlist', () => {
    const { container } = render(
      <Markdown source="Hello [element:NPMWordmark] there." />,
    );
    const svg = container.querySelector(
      'svg[aria-label="Node Package Manager (NPM)"]',
    );
    expect(svg).not.toBeNull();

    const link = container.querySelector('a');
    expect(link?.getAttribute('aria-label')).toBe(
      enData['links-npm-css-calipers-label'],
    );
    expect(link?.getAttribute('title')).toBe(
      enData['links-npm-css-calipers-label'],
    );
  });

  it('defaults [element:GitHubWordmark] to site-en (portfolio repo) with the right label', () => {
    const { container } = render(
      <Markdown source="[element:GitHubWordmark]" />,
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe(
      sharedStrings.githubUrl,
    );
    expect(link?.getAttribute('aria-label')).toBe(
      enData['links-github-label'],
    );
    expect(link?.getAttribute('title')).toBe(
      enData['links-github-label'],
    );
  });

  it('supports [element:GitHubWordmark|csscalipers-en] by linking to CSS Calipers', () => {
    const { container } = render(
      <Markdown source="[element:GitHubWordmark|csscalipers-en]" />,
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe(
      sharedStrings.githubCSSCalipersUrl,
    );
    expect(link?.getAttribute('aria-label')).toBe(
      enData['links-github-css-calipers-label'],
    );
    expect(link?.getAttribute('title')).toBe(
      enData['links-github-css-calipers-label'],
    );
  });

  it('supports [element:GitHubWordmark|site-fr] with a French label', () => {
    const { container } = render(
      <Markdown source="[element:GitHubWordmark|site-fr]" />,
    );
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe(
      sharedStrings.githubUrl,
    );
    expect(link?.getAttribute('aria-label')).toBe(
      frData['links-github-label'],
    );
    expect(link?.getAttribute('title')).toBe(
      frData['links-github-label'],
    );
  });

  it('does not render disallowed inline HTML tags', () => {
    const { container } = render(
      <Markdown source={'Hello <script>alert("no")</script>!'} />,
    );
    expect(container.querySelector('script')).toBeNull();
  });

  it('adds data-code="inline" to inline code spans', () => {
    const { container } = render(
      <Markdown source={'Hello `inline` world'} />,
    );
    const code = container.querySelector(
      'p code[data-code="inline"]',
    );
    expect(code?.textContent).toBe('inline');
  });

  it('adds data-code="block" to fenced code blocks', () => {
    const { container } = render(
      <Markdown source={'```ts\nconst value = 1;\n```'} />,
    );
    const pre = container.querySelector('pre[data-code="block"]');
    expect(pre).not.toBeNull();
  });

  it('preserves blank lines inside fenced code blocks', () => {
    const { container } = render(
      <Markdown source={'```\nLine 1\n\nLine 3\n```'} />,
    );
    const codeBlock = container.querySelector('pre code');
    expect(codeBlock?.textContent).toContain('Line 1\n\nLine 3');
  });

  it('adds the prism language class for fenced code blocks with a language', () => {
    const { container } = render(
      <Markdown source={'```ts\nconst value = 1;\n```'} />,
    );
    const pre = container.querySelector('pre');
    expect(pre?.className).toContain('language-typescript');
  });

  it('defaults fenced code blocks to language-text when no language is provided', () => {
    const { container } = render(
      <Markdown source={'```\nconst value = 1;\n```'} />,
    );
    const pre = container.querySelector('pre');
    expect(pre?.className).toContain('language-text');
  });

  it('renders MockCode blocks and allows inline markup inside', () => {
    const { container } = render(
      <Markdown
        source={[
          '[MockCode|ts]',
          'Intro with <abbr title="Cascading Style Sheets">CSS</abbr>.',
          '',
          '```ts',
          'const value = 1;',
          '```',
          '',
          'Outro.',
          '[/MockCode]',
        ].join('\n')}
        asUi={{ codeBlocks: true }}
      />,
    );

    const abbr = container.querySelector(
      'abbr[title="Cascading Style Sheets"]',
    ) as HTMLElement | null;
    expect(abbr?.textContent).toBe('CSS');

    const nestedPre = container.querySelector('pre') as HTMLElement | null;
    const code = nestedPre?.querySelector('code');
    expect(code?.textContent).toContain('const value = 1;');
  });

  it('forces full data-ui inside MockCode content', () => {
    const { container } = render(
      <Markdown
        source={[
          '[MockCode|ts]',
          'A paragraph.',
          '',
          '- a list item',
          '[/MockCode]',
        ].join('\n')}
      />,
    );

    const paragraph = container.querySelector('p[data-ui="paragraph"]');
    expect(paragraph?.textContent).toBe('A paragraph.');

    const list = container.querySelector('ul[data-ui="list-unordered"]');
    expect(list).not.toBeNull();
  });

  it('renders MockCode blocks even when the opening tag has trailing content', () => {
    const { container } = render(
      <Markdown
        source={[
          '[MockCode|ts] // opening tag line includes content',
          '// second line',
          '[/MockCode]',
          '',
          '[MockCode|ts]',
          'third line',
          '[/MockCode]',
        ].join('\n')}
      />,
    );

    const blocks = container.querySelectorAll(
      'pre[data-ui="mock-code-block"]',
    );
    expect(blocks).toHaveLength(2);
  });

  it('renders [br] as a single line break', () => {
    const { container } = render(<Markdown source={'A[br]B'} />);
    expect(container.querySelectorAll('br')).toHaveLength(1);
  });

  it('renders [br|3] as three line breaks', () => {
    const { container } = render(
      <Markdown source={'A[br|3]B'} />,
    );
    expect(container.querySelectorAll('br')).toHaveLength(3);
  });

  it('throws on invalid [br] shortcode values', () => {
    expect(() => render(<Markdown source="[br|0]" />)).toThrow(
      /Invalid \[br\] shortcode value/,
    );
    expect(() => render(<Markdown source="[br|-1]" />)).toThrow(
      /Invalid \[br\] shortcode value/,
    );
    expect(() => render(<Markdown source="[br|1.5]" />)).toThrow(
      /Invalid \[br\] shortcode value/,
    );
    expect(() => render(<Markdown source="[br|]" />)).toThrow(
      /Invalid \[br\] shortcode value/,
    );
    expect(() => render(<Markdown source="[br|   ]" />)).toThrow(
      /Invalid \[br\] shortcode value/,
    );
  });

  it('renders [br] shortcodes inside inline spans', () => {
    const { container } = render(
      <Markdown source={'Hello <span>A[br|2]B</span>!'} />,
    );
    expect(container.querySelectorAll('br')).toHaveLength(2);
  });

  it('trims whitespace inside [br| N ]', () => {
    const { container } = render(
      <Markdown source={'A[br|  2  ]B'} />,
    );
    expect(container.querySelectorAll('br')).toHaveLength(2);
  });

  it('accepts uppercase [BR] shortcodes', () => {
    const { container } = render(<Markdown source={'A[BR|2]B'} />);
    expect(container.querySelectorAll('br')).toHaveLength(2);
  });

  it('throws on invalid [br] shortcodes inside inline spans', () => {
    expect(() =>
      render(<Markdown source={'<span>[br|0]</span>'} />),
    ).toThrow(/Invalid \[br\] shortcode value/);
  });

  it('marks a single paragraph as first and last', () => {
    const { container } = render(<Markdown source="Solo" />);
    const paragraph = container.querySelector('p');
    expect(paragraph?.getAttribute('data-first')).toBe('true');
    expect(paragraph?.getAttribute('data-last')).toBe('true');
  });

  it('marks first and last paragraphs when multiple exist', () => {
    const { container } = render(
      <Markdown source={'First\n\nSecond'} />,
    );
    const paragraphs = Array.from(
      container.querySelectorAll('p'),
    );
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]?.getAttribute('data-first')).toBe(
      'true',
    );
    expect(paragraphs[0]?.getAttribute('data-last')).toBe(
      null,
    );
    expect(paragraphs[1]?.getAttribute('data-first')).toBe(
      null,
    );
    expect(paragraphs[1]?.getAttribute('data-last')).toBe(
      'true',
    );
  });

  it('adds data-ui attributes for all AsUiConfig flags', () => {
    const { container } = render(
      <Markdown
        source={[
          '# Heading',
          '',
          'Paragraph with a [link](https://example.com).',
          '',
          '- Item one',
          '- Item two',
          '',
          '1. First',
          '2. Second',
          '',
          '> A quote',
          '',
          '```',
          'const value = 1;',
          '```',
        ].join('\n')}
        asUi={{
          headings: true,
          paragraphs: true,
          links: true,
          listUnordered: true,
          listOrdered: true,
          blockquotes: true,
          codeBlocks: true,
        }}
        openLinksInNewTab={false}
      />,
    );

    const heading = container.querySelector('h1');
    expect(heading?.getAttribute('data-ui')).toBe('heading');

    const paragraph = container.querySelector('p');
    expect(paragraph?.getAttribute('data-ui')).toBe('paragraph');

    const link = container.querySelector('a');
    expect(link?.getAttribute('data-ui')).toBe('link');

    const unorderedList = container.querySelector('ul');
    expect(unorderedList?.getAttribute('data-ui')).toBe(
      'list-unordered',
    );

    const orderedList = container.querySelector('ol');
    expect(orderedList?.getAttribute('data-ui')).toBe('list-ordered');

    const blockquote = container.querySelector('blockquote');
    expect(blockquote?.getAttribute('data-ui')).toBe('blockquote');

    const codeBlock = container.querySelector('pre');
    expect(codeBlock?.getAttribute('data-ui')).toBe('code-block');
  });

  it('applies classNameMap for headings (clsx(headings, h*))', () => {
    const { container } = render(
      <Markdown
        source={['# Title', '', '## Subtitle'].join('\n')}
        classNameMap={{
          headings: 'headingBase',
          h1: 'headingH1',
          h2: 'headingH2',
        }}
      />,
    );

    const h1 = container.querySelector('h1');
    expect(h1).toHaveClass('headingBase');
    expect(h1).toHaveClass('headingH1');

    const h2 = container.querySelector('h2');
    expect(h2).toHaveClass('headingBase');
    expect(h2).toHaveClass('headingH2');
  });

  it('applies classNameMap for paragraphs, links, lists, blockquotes, and codeBlocks', () => {
    const { container } = render(
      <Markdown
        source={[
          'A paragraph with a [link](https://example.com).',
          '',
          '- Item',
          '',
          '1. First',
          '',
          '> Quote',
          '',
          '```ts',
          'const value = 1;',
          '```',
        ].join('\n')}
        openLinksInNewTab={false}
        classNameMap={{
          paragraphs: 'pClass',
          links: 'aClass',
          listUnordered: 'ulClass',
          listOrdered: 'olClass',
          blockquotes: 'blockquoteClass',
          codeBlocks: 'preClass',
        }}
      />,
    );

    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('pClass');

    const link = container.querySelector('a');
    expect(link).toHaveClass('aClass');

    const ul = container.querySelector('ul');
    expect(ul).toHaveClass('ulClass');

    const ol = container.querySelector('ol');
    expect(ol).toHaveClass('olClass');

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toHaveClass('blockquoteClass');

    const pre = container.querySelector('pre');
    expect(pre).toHaveClass('preClass');
  });
});
