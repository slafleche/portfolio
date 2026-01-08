import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Markdown } from '@/components/Markdown';

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

  it('preserves blank lines inside fenced code blocks', () => {
    const { container } = render(
      <Markdown source={'```\nLine 1\n\nLine 3\n```'} />,
    );
    const codeBlock = container.querySelector('pre code');
    expect(codeBlock?.textContent).toContain('Line 1\n\nLine 3');
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
});
