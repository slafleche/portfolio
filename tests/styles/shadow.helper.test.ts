import { describe, expect, it } from 'vitest';
import {
  boxShadow,
  globalDropShadowFilter,
  globalDropShadowFilterFlush,
  shadowTotalX,
  shadowTotalY,
} from '@/styles/helpers/shadow.helper';
import { colorVars } from '@/styles/componentTokens/global.componentTokens';
import { m } from '@/styles/measurementKit';

describe('shadow.helper', () => {
  it('formats single and multiple box shadows', () => {
    const single = boxShadow({
      x: m(1, 'px'),
      y: m(2, 'px'),
      blur: m(3, 'px'),
      color: colorVars.brand,
      alpha: 0.5,
    });
    expect(single).toBe('1px 2px 3px 0 rgb(91 65 153 / 0.5)');

    const multi = boxShadow([
      { x: m(0, 'px'), y: m(1, 'px') },
      { x: m(1, 'px'), y: m(2, 'px'), inset: true },
    ]);
    expect(multi).toContain(' inset');
    expect(multi.split(', ')).toHaveLength(2);
  });

  it('builds drop-shadow filters with defaults', () => {
    const filter = globalDropShadowFilter();
    expect(filter.startsWith('drop-shadow(')).toBe(true);

    const flush = globalDropShadowFilterFlush({
      x: m(2, 'px'),
      y: m(0, 'px'),
      blur: m(4, 'px'),
    });
    expect(flush.split('drop-shadow')).toHaveLength(3);
  });

  it('computes total shadow spans on each axis', () => {
    const spanY = shadowTotalY({
      y: m(3, 'px'),
      blur: m(2, 'px'),
    });
    expect(spanY.css()).toBe('7px');

    const spanX = shadowTotalX({
      x: m(4, 'px'),
      blur: m(1, 'px'),
    });
    expect(spanX.css()).toBe('6px');
  });
});
