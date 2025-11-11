import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  backgroundFromManifest,
  backgroundImageForWidth,
  backgroundImageForStep,
  backgrounds,
} from '@/styles/helpers/background.helper';
import { color } from '@/styles/helpers/colorWrap.helper';

const mockGetImage = vi.fn();

vi.mock('@/lib/images', () => ({
  getImage: (...args: unknown[]) => mockGetImage(...(args as [string])),
}));

const sampleImage = {
  original: { url: '/images/sample/original.png' },
  variants: {
    avif: [
      { w: 400, url: '/images/sample/400.avif' },
      { w: 800, url: '/images/sample/800.avif' },
    ],
    webp: [{ w: 400, url: '/images/sample/400.webp' }],
    jpg: [{ w: 100, url: '/images/sample/100.jpg' }],
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
    const base = backgroundFromManifest('sample');
    expect(base.backgroundImage).toBe('url("/images/sample/original.png")');

    const widthOverride = backgroundImageForWidth('sample', 500);
    expect(widthOverride.backgroundImage).toContain('image-set(');

    const stepOverride = backgroundImageForStep('sample', 1);
    expect(stepOverride.backgroundImage).toContain('/images/sample/400.avif');
  });

  it('falls back gracefully when manifest entry is missing', () => {
    mockGetImage
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    const base = backgroundFromManifest('missing');
    expect(base.backgroundImage).toBeUndefined();

    mockGetImage.mockReturnValueOnce(undefined);
    const widthOverride = backgroundImageForWidth('missing', 400);
    expect(widthOverride).toEqual({});

    mockGetImage.mockImplementation(() => sampleImage);
  });

  it('coerces linear-gradient image strings without url()', () => {
    const styles = backgrounds({
      image: 'linear-gradient(to bottom, #000, #fff)',
    });
    expect(styles.backgroundImage).toBe('linear-gradient(to bottom, #000, #fff)');
  });

  it('returns empty object when no props provided', () => {
    expect(backgrounds({})).toEqual({
      backgroundPosition: '50% 50%',
      backgroundRepeat: 'no-repeat',
    });
  });
});
