import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  FullwidthOnly,
  CompactOnly,
} from '@/styles/responsive';

const mockUseMediaQuery = vi.fn(() => true);

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
        <p>wide</p>
      </FullwidthOnly>,
    );
    expect(screen.getByText('wide')).toBeVisible();
  });

  it('hides children when fullwidth media query fails', () => {
    mockUseMediaQuery.mockReturnValue(false);
    const { container } = render(
      <FullwidthOnly>
        <p>wide</p>
      </FullwidthOnly>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('CompactOnly passthrough renders immediately (placeholder)', () => {
    render(
      <CompactOnly>
        <span>compact</span>
      </CompactOnly>,
    );
    expect(screen.getByText('compact')).toBeVisible();
  });
});
