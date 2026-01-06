import { describe, expect, it } from 'vitest';
import type { StyleRule } from '@vanilla-extract/css';
import {
  globalMediaQueryStyle,
  globalComponentMediaQueryStyle,
} from '@/styles/responsive/mediaQueries';

const findQueryKey = (styles: StyleRule) => {
  const mediaBlock = (styles as Record<string, unknown>)[
    '@media'
  ] as Record<string, unknown> | undefined;
  return mediaBlock
    ? Object.keys(mediaBlock).find((key) => key.includes('min-width'))
    : undefined;
};

describe('mediaQueries helpers', () => {
  it('globalMediaQueryStyle returns a media query map', () => {
    const styles = globalMediaQueryStyle({
      fullSize: {
        color: 'red',
      },
    });
    const mediaBlock = (styles as Record<string, unknown>)[
      '@media'
    ] as
      | Record<string, Record<string, unknown>>
      | undefined;
    const queryKey = findQueryKey(styles);
    expect(mediaBlock).toBeTruthy();
    expect(queryKey).toBeTruthy();
    expect(mediaBlock?.[queryKey as string]).toEqual({
      color: 'red',
    });
  });

  it('globalComponentMediaQueryStyle returns a media query map', () => {
    const styles = globalComponentMediaQueryStyle({
      not_footer_oneColumn: {
        width: '200px',
        height: '200px',
      },
    });
    const mediaBlock = (styles as Record<string, unknown>)[
      '@media'
    ] as
      | Record<string, Record<string, unknown>>
      | undefined;
    const queryKey = findQueryKey(styles);
    expect(mediaBlock).toBeTruthy();
    expect(queryKey).toBeTruthy();
    expect(mediaBlock?.[queryKey as string]).toEqual({
      width: '200px',
      height: '200px',
    });
  });
});
