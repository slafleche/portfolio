import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('does not render empty divs from raw html blocks', () => {
    const { container } = render(
      <Markdown source={'First\n\n<div></div>\n\nSecond'} />,
    );
    const markdownRoot = container.firstElementChild;
    const emptyBlocks = markdownRoot
      ? Array.from(markdownRoot.querySelectorAll('div')).filter(
          (node) =>
            node.textContent?.trim() === '' &&
            node.childElementCount === 0,
        )
      : [];
    expect(emptyBlocks).toHaveLength(0);
  });
});
