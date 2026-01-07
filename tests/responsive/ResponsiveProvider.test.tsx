import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import {
  ResponsiveProvider,
  useResponsive,
} from '@/lib/responsive/ResponsiveProvider';

const { mockUseMedia } = vi.hoisted(() => ({
  mockUseMedia: vi.fn<(...args: unknown[]) => { fullSize: boolean }>(
    () => ({ fullSize: true }),
  ),
}));

vi.mock('@/styles/responsive', () => ({
  useMedia: (...args: unknown[]) => mockUseMedia(...args),
}));

const Consumer = () => {
  const state = useResponsive();
  return <div data-testid="responsive">{state.mode ?? 'none'}</div>;
};

describe('ResponsiveProvider', () => {
  beforeEach(() => {
    mockUseMedia.mockReset();
  });

  it('marks mode as fullSize when useMedia reports true', () => {
    mockUseMedia.mockReturnValue({ fullSize: true });
    render(
      <ResponsiveProvider>
        <Consumer />
      </ResponsiveProvider>,
    );
    expect(screen.getByTestId('responsive')).toHaveTextContent(
      'fullSize',
    );
  });

  it('falls back to undefined mode when breakpoint not matched', () => {
    mockUseMedia.mockReturnValue({ fullSize: false });
    render(
      <ResponsiveProvider>
        <Consumer />
      </ResponsiveProvider>,
    );
    expect(screen.getByTestId('responsive')).toHaveTextContent(
      'none',
    );
  });
});
