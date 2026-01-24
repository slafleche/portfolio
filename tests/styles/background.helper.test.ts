import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  backgroundFromManifest,
  backgroundImageForStep,
  backgroundImageForWidth,
  backgrounds,
} from '@/styles/helpers/background.helper';
import { color } from '@/styles/helpers/colorWrap.helper';

const mockGetImage = vi.fn();

vi.mock('@/lib/images', () => ({
  getImage: (...args: unknown[]) =>
    mockGetImage(...(args as [string])),
}));

const sampleImage = {
  original: { url: '/images/sample/original.png' },
  variants: {
    avif: [
      {
        w: 400,
        url: '/images/sample/400.avif',
      },
      { w: 800, url: '/images/sample/800.avif' },
    ],
    webp: [
      { w: 400, url: '/images/sample/400.webp' },
    ],
    jpg: [
      { w: 100, url: '/images/sample/100.jpg' },
    ],
  },
};

describe('background.helper', () => {
  beforeEach(() => {
    mockGetImage.mockReset();
    mockGetImage.mockReturnValue(sampleImage);
  });

  it('spreads color/image/preset styles via backgrounds()', () => {
    const result = backgrounds({
      color: color('#ff00ff'),
      position: 'top center',
      image: '/images/bg.png',
    });
    expect(result.backgroundColor).toBe('rgb(255 0 255)');
    expect(result.backgroundPosition).toBe('top center');
    expect(result.backgroundImage).toBe('url(/images/bg.png)');
  });

  it('builds manifest-based fallbacks and image sets', () => {
    const base = backgroundFromManifest('sample', mockGetImage);
    expect(base.backgroundImage).toBe(
      'url("/images/sample/original.png")',
    );

    const widthOverride = backgroundImageForWidth(
      'sample',
      500,
      mockGetImage,
    );
    expect(widthOverride.backgroundImage).toContain('image-set(');

    const stepOverride = backgroundImageForStep(
      'sample',
      1,
      mockGetImage,
    );
    expect(stepOverride.backgroundImage).toContain(
      '/images/sample/400.avif',
    );
  });

  it('falls back gracefully when manifest entry is missing', () => {
    mockGetImage
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    const base = backgroundFromManifest('missing', mockGetImage);
    expect(base.backgroundImage).toBeUndefined();

    mockGetImage.mockReturnValueOnce(undefined);
    const widthOverride = backgroundImageForWidth(
      'missing',
      400,
      mockGetImage,
    );
    expect(widthOverride).toEqual({});

    mockGetImage.mockImplementation(() => sampleImage);
  });

  it('coerces linear-gradient image strings without url()', () => {
    const styles = backgrounds({
      image: 'linear-gradient(to bottom, #000, #fff)',
    });
    expect(styles.backgroundImage).toBe(
      'linear-gradient(to bottom, #000, #fff)',
    );
  });

  it('does not double-wrap background image strings that already use url(...)', () => {
    const styles = backgrounds({
      image: 'url("/images/bg.png")',
    });
    expect(styles.backgroundImage).toBe('url("/images/bg.png")');
  });

  it('accepts url as shorthand for background-image url(...)', () => {
    const styles = backgrounds({
      url: '/images/bg.png',
    } as any);
    expect(styles.backgroundImage).toBe('url(/images/bg.png)');
  });

  it('quotes data URLs when building url(...)', () => {
    const styles = backgrounds({
      url: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E',
    } as any);
    expect(styles.backgroundImage).toBe(
      'url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E")',
    );
  });

  it('encodes spaces in data URLs (so url(...) remains parseable)', () => {
    const styles = backgrounds({
      url: "data:image/svg+xml,%3Csvg xmlns='http://example.com'%3E%3C/svg%3E",
    } as any);
    expect(styles.backgroundImage).toBe(
      'url("data:image/svg+xml,%3Csvg%20xmlns=\'http://example.com\'%3E%3C/svg%3E")',
    );
  });

  it('supports fallbackImage for image-set() via @supports override', () => {
    const imageSet = 'image-set(url("/x.webp") type("image/webp"))';
    const styles = backgrounds({
      image: imageSet,
      fallbackImage: '/images/fallback.png',
    });

    expect(styles.backgroundImage).toBe('url(/images/fallback.png)');

    const supports = (styles as any)['@supports'] as
      | Record<string, unknown>
      | undefined;
    const entries = Object.entries(supports ?? {});
    expect(entries).toHaveLength(1);
    expect(entries[0]?.[1]).toEqual({ backgroundImage: imageSet });
  });

  it('returns empty object when no props provided', () => {
    expect(backgrounds({})).toEqual({
      backgroundPosition: '50% 50%',
      backgroundRepeat: 'no-repeat',
    });
  });
});
