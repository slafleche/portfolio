import { describe, expect, it } from 'vitest';
import {
  parseAvailableLocalesSource,
  parseDebugRoutesSource,
} from '../../scripts/devWithDebug.mjs';

describe('devWithDebug helpers', () => {
  it('parses locale arrays from source file content', () => {
    const locales = parseAvailableLocalesSource(
      "export const AVAILABLE_LOCALES = ['en', 'fr'] as const;",
    );
    expect(locales).toEqual([
      'en',
      'fr',
    ]);
  });

  it('parses debug routes JSON safely', () => {
    const routes = parseDebugRoutesSource(
      JSON.stringify({
        baseLocale: 'en',
        pages: [
          'favicons',
          'formelements',
        ],
      }),
    );
    expect(routes).toEqual({
      baseLocale: 'en',
      pages: [
        'favicons',
        'formelements',
      ],
    });
    expect(parseDebugRoutesSource('invalid')).toBeNull();
  });
});
