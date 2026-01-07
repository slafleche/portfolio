import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CompactOnly,FullwidthOnly } from '@/styles/responsive';

const mockUseMediaQuery = vi.fn<(...args: unknown[]) => boolean>(
  () => true,
);

vi.mock('@/styles/responsive/mediaFactory', () => ({
  queriesToStrings: (queries: Record<string, unknown>) => queries,
  useMediaQuery: (...args: unknown[]) => mockUseMediaQuery(...args),
  useMediaFromMap: () => ({}),
  makeClientFns: () => ({ fullSize: () => true }),
}));

describe('responsive entrypoints', () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReset();
  });

  it('renders children when fullwidth media query matches', () => {
    mockUseMediaQuery.mockReturnValue(true);
    render(
      <FullwidthOnly>
        <p data-responsive="wide">wide</p>
      </FullwidthOnly>,
    );
    const wide = document.querySelector(
      '[data-responsive="wide"]',
    );
    expect(wide).not.toBeNull();
  });

  it('hides children when fullwidth media query fails', () => {
    mockUseMediaQuery.mockReturnValue(false);
    const { container } = render(
      <FullwidthOnly>
        <p data-responsive="wide">wide</p>
      </FullwidthOnly>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('CompactOnly passthrough renders immediately (placeholder)', () => {
    render(
      <CompactOnly>
        <span data-responsive="compact">compact</span>
      </CompactOnly>,
    );
    const compact = document.querySelector(
      '[data-responsive="compact"]',
    );
    expect(compact).not.toBeNull();
  });
});
