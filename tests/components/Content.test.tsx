import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Content from '@/components/responsive/Content';

describe('Content', () => {
  it('renders data-query attributes on the root element', () => {
    const { container } = render(
      <Content
        queryDataAttributes={{
          compact: 'no-padding',
        }}
      >
        <div>Body</div>
      </Content>,
    );

    const root = container.querySelector('[data-ui="content"]');
    expect(root).toBeTruthy();
    expect(root).toHaveAttribute('data-query-compact', 'no-padding');
    expect(root).toHaveAttribute('data-query-snug', 'no-padding');
  });
});
