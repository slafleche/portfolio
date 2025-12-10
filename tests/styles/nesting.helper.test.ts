import { describe, expect, it } from 'vitest';
import nest from '@/styles/helpers/nesting.helper';

describe('nesting.helper', () => {
  it('duplicates plain style rules across base selectors', () => {
    const result = nest('button, [role="button"]', {
      color: 'red',
    });

    expect(result).toEqual({
      '&button': { color: 'red' },
      '&[role="button"]': { color: 'red' },
    });
  });

  it('combines nested selectors with base variants', () => {
    const result = nest('&:is(button, a[href])', [
      {
        '&:focus-visible': { outline: '2px solid currentColor' },
      },
      { '&:hover, &.is-hover': { textDecoration: 'underline' } },
    ]);

    expect(result['&:is(button, a[href]):focus-visible']).toEqual({
      outline: '2px solid currentColor',
    });
    expect(
      result[
        '&:is(button, a[href]):hover, &:is(button, a[href]).is-hover'
      ],
    ).toEqual({ textDecoration: 'underline' });
  });
});
