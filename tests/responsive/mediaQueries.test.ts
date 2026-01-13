import type { StyleRule } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { describe, expect, it } from 'vitest';

import { paddings } from '@/styles/helpers/spacing.helper';
import {
  globalComponentMediaQueryStyle,
  globalMediaQueryStyle,
  mediaQueryStyle,
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

  it('mediaQueryStyle nests selectors under the compact media query', () => {
    const someOtherClass = 'someOtherClass';
    const styles = mediaQueryStyle({
      compact: {
        selectors: {
          [`&.${someOtherClass}`]: {
            ...paddings({ horizontal: m(10) }),
          },
        },
      },
    });

    const mediaBlock = (styles as Record<string, unknown>)[
      '@media'
    ] as
      | Record<string, Record<string, unknown>>
      | undefined;
    const mediaKey = mediaBlock
      ? Object.keys(mediaBlock).find((key) =>
          key.includes('max-width'),
        )
      : undefined;

    expect(mediaBlock).toBeTruthy();
    expect(mediaKey).toBeTruthy();
    expect(mediaBlock?.[mediaKey as string]).toEqual({
      selectors: {
        [`&.${someOtherClass}`]: {
          paddingRight: '10px',
          paddingLeft: '10px',
        },
      },
    });
  });
});
