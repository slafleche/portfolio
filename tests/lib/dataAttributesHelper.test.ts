import { describe, expect, it } from 'vitest';
import { dataAttributesHelper } from '@/lib/dataAttributesHelper';

describe('dataAttributesHelper', () => {
  it('prefixes keys as data attributes', () => {
    expect(
      dataAttributesHelper('query', {
        compact: 'no-padding',
        snug: 'no-padding',
      }),
    ).toEqual({
      'data-query-compact': 'no-padding',
      'data-query-snug': 'no-padding',
    });
  });
});
