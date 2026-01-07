import { m } from 'css-calipers';
import { describe, expect, it } from 'vitest';

import {
  queriesToStrings,
  toQueryString,
} from '@/styles/responsive/mediaFactory';

describe('mediaFactory', () => {
  it('creates valid media query strings', () => {
    const query = toQueryString({
      type: 'screen',
      minWidth: m(768),
      maxWidth: m(1200),
    });
    expect(query).toBe(
      'screen and (min-width: 768px) and (max-width: 1200px)',
    );
  });

  it('normalizes query maps to strings', () => {
    const queries = queriesToStrings({
      fullSize: { minWidth: m(1280) },
      raw: 'print',
    });
    expect(queries.fullSize).toBe('screen and (min-width: 1280px)');
    expect(queries.raw).toBe('print');
  });
});
