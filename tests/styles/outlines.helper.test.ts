import { m } from 'css-calipers';
import { describe, expect, it } from 'vitest';

import { color } from '@/styles/helpers/colorWrap.helper';
import { outlines } from '@/styles/helpers/outlines.helper';

describe('outlines.helper', () => {
  it('uses token defaults when no overrides provided', () => {
    expect(outlines()).toEqual({
      outline: '4px solid Highlight',
      outlineOffset: '2px',
    });
  });

  it('formats outline shorthand with custom values', () => {
    const styles = outlines({
      color: color('#123456').alpha(0.5),
      width: m(3),
      offset: m(1, 'rem'),
      style: 'dashed',
    });

    expect(styles).toEqual({
      outline: '3px dashed rgb(18 52 86 / 0.5)',
      outlineOffset: '1rem',
    });
  });
});
