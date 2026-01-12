import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import ContentWithTitle from '@/components/responsive/ContentWithTitle';

describe('ContentWithTitle', () => {
  it('renders the title and data-query attributes', () => {
    const { container } = render(
      <ContentWithTitle
        title="Section title"
        queryDataAttributes={{
          compact: 'no-padding',
        }}
      >
        <div>Body text</div>
      </ContentWithTitle>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Section title',
      }),
    ).toBeInTheDocument();

    const root = container.querySelector('[data-ui="content"]');
    expect(root).toHaveAttribute('data-query-compact', 'no-padding');
  });
});
