import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupportsFallback } from '@/styles/helpers/supportsFallback.helper';

const globalStyleMock = vi.fn();

vi.mock('@vanilla-extract/css', () => ({
  globalStyle: (...args: unknown[]) =>
    globalStyleMock(...(args as Parameters<typeof globalStyleMock>)),
}));

describe('supportsFallback.helper', () => {
  beforeEach(() => {
    globalStyleMock.mockReset();
  });

  it('applies supported/fallback blocks for each selector', () => {
    const applySupports = createSupportsFallback('display: grid');
    applySupports({
      selector: [
        '.foo',
        '#bar',
      ],
      supported: { display: 'grid' },
      fallback: { display: 'block' },
    });

    expect(globalStyleMock).toHaveBeenCalledTimes(2);
    expect(globalStyleMock).toHaveBeenNthCalledWith(1, '.foo', {
      '@supports': {
        '(display: grid)': { display: 'grid' },
        'not (display: grid)': { display: 'block' },
      },
    });
  });

  it('rejects blank queries', () => {
    expect(() => createSupportsFallback('  ')).toThrow(
      /non-empty query/,
    );
  });
});
