import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach,describe, expect, it, vi } from 'vitest';

import AnchorMenu from '@/components/AnchorMenu';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: height,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
    writable: true,
  });
};

const mockLayoutFns = () => {
  const getComputedStyleSpy = vi
    .spyOn(window, 'getComputedStyle')
    .mockImplementation((el) => {
      const element = el as HTMLElement;
      return {
        paddingTop: element.dataset.testPaddingTop ?? '0px',
        paddingBottom: element.dataset.testPaddingBottom ?? '0px',
      } as CSSStyleDeclaration;
    });

  const getBoundingClientRectSpy = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      const element = this;
      const height = Number(element.dataset.testHeight ?? '0');
      return {
        width: 0,
        height,
        top: 0,
        bottom: height,
        left: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    });

  const rafSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((cb) => {
      cb(0);
      return 1;
    });
  const cafSpy = vi
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation(() => {});

  return {
    getComputedStyleSpy,
    getBoundingClientRectSpy,
    rafSpy,
    cafSpy,
  };
};

const renderMenu = () =>
  render(
    <WindowSizeProvider>
      <AnchorMenu
        anchorNavLabel="Section navigation"
        anchorLinks={[
          { title: 'One', href: '#one' },
          { title: 'Two', href: '#two' },
          { title: 'Three', href: '#three' },
        ]}
      />
    </WindowSizeProvider>,
  );

describe('AnchorMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides the menu when a visible menu no longer fits', async () => {
    setViewportSize(1024, 900);
    mockLayoutFns();
    renderMenu();

    const list = screen.getByRole('list');
    const root = list.parentElement as HTMLElement;
    root.dataset.testPaddingTop = '24';
    root.dataset.testPaddingBottom = '24';
    list.dataset.testHeight = '300';
    Object.defineProperty(list, 'scrollHeight', {
      value: 300,
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(root).toHaveAttribute('data-visible', 'visible');
    });

    list.dataset.testHeight = '600';
    Object.defineProperty(list, 'scrollHeight', {
      value: 600,
      configurable: true,
    });
    setViewportSize(1024, 400);

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(root).toHaveAttribute('data-visible', 'hidden');
    });
  });

  it('shows the menu when a hidden menu fits again', async () => {
    setViewportSize(1024, 400);
    mockLayoutFns();
    renderMenu();

    const list = screen.getByRole('list');
    const root = list.parentElement as HTMLElement;
    root.dataset.testPaddingTop = '24';
    root.dataset.testPaddingBottom = '24';
    list.dataset.testHeight = '600';
    Object.defineProperty(list, 'scrollHeight', {
      value: 600,
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(root).toHaveAttribute('data-visible', 'hidden');
    });

    setViewportSize(1024, 900);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(root).toHaveAttribute('data-visible', 'visible');
    });
  });

  it('hides the menu on focus when the viewport shrinks without resize', async () => {
    setViewportSize(1024, 900);
    mockLayoutFns();
    renderMenu();

    const list = screen.getByRole('list');
    const root = list.parentElement as HTMLElement;
    root.dataset.testPaddingTop = '24';
    root.dataset.testPaddingBottom = '24';
    list.dataset.testHeight = '600';
    Object.defineProperty(list, 'scrollHeight', {
      value: 600,
      configurable: true,
    });

    setViewportSize(1024, 400);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(root).toHaveAttribute('data-visible', 'hidden');
    });
  });
});
