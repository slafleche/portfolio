import React from 'react';

export type ScrollHarnessProps = {
  height?: number;
  beforeHeight?: number;
  afterHeight?: number;
  children: React.ReactNode;
};

export function ScrollHarness({
  height = 400,
  beforeHeight = 0,
  afterHeight = 0,
  children,
}: ScrollHarnessProps) {
  return (
    <div
      data-testid="scroll-harness-container"
      style={{
        maxHeight: height,
        overflowY: 'auto',
      }}
    >
      {beforeHeight > 0 ? (
        <div
          data-testid="scroll-harness-before"
          style={{ height: beforeHeight }}
          aria-hidden
        />
      ) : null}
      <div data-testid="scroll-harness-content">{children}</div>
      {afterHeight > 0 ? (
        <div
          data-testid="scroll-harness-after"
          style={{ height: afterHeight }}
          aria-hidden
        />
      ) : null}
    </div>
  );
}

type GetByTestId = (id: string) => HTMLElement;

export type ScrollHarnessHandles = {
  container: HTMLElement;
  getScrollTop: () => number;
  setScrollTop: (value: number) => void;
};

export function createScrollHarnessHandles(
  getByTestId: GetByTestId,
): ScrollHarnessHandles {
  const container = getByTestId('scroll-harness-container');

  return {
    container,
    getScrollTop: () => (container as HTMLElement).scrollTop,
    setScrollTop: (value: number) => {
      (container as HTMLElement).scrollTop = value;
    },
  };
}
