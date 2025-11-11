import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  WindowSizeProvider,
  useWindowSize,
} from '@/lib/responsive/WindowSizeContext';

const TestConsumer = () => {
  const { width, height } = useWindowSize();
  return (
    <div data-testid="size">
      {width}x{height}
    </div>
  );
};

const setViewport = (width: number, height: number) => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: height,
    configurable: true,
  });
};

describe('WindowSizeContext', () => {
  beforeEach(() => {
    setViewport(1024, 768);
  });

  it('provides current viewport size and updates on resize', () => {
    render(
      <WindowSizeProvider>
        <TestConsumer />
      </WindowSizeProvider>,
    );

    expect(screen.getByTestId('size')).toHaveTextContent('1024x768');

    act(() => {
      setViewport(800, 600);
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId('size')).toHaveTextContent('800x600');
  });

  it('throws when hook used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      /useWindowSize must be used within a WindowSizeProvider/,
    );
  });
});
