import { describe, expect, it } from 'vitest';
import {
  color,
  mixWithAlpha,
} from '@/styles/helpers/colorWrap.helper';

describe('colorWrap.helper', () => {
  it('wraps colors immutably and exposes css/alpha helpers', () => {
    const base = color('#ff0000');
    const tinted = base.alpha(0.5);

    expect(base.css()).toBe('rgb(255 0 0)');
    expect(tinted.css()).toBe('rgb(255 0 0 / 0.5)');
    expect(base.alpha()).toBe(1);
    expect(tinted.alpha()).toBeCloseTo(0.5);
  });

  it('supports mixing while preserving alpha via mixWithAlpha', () => {
    const red = color('#ff0000');
    const blue = color('#0000ff');
    const mixed = mixWithAlpha(red, blue, 0.5, 0.75);

    expect(mixed.alpha()).toBeCloseTo(0.75);
    // Result should be a purple-ish color
    expect(mixed.css()).toBe('rgb(180 0 180 / 0.75)');
  });

  it('converts to/from OKLCH without mutating inputs', () => {
    const base = color('#00ff00');
    const oklch = color.toOKLCH(base);
    expect(oklch).toBeDefined();
    const roundTrip = color.fromOKLCH(oklch!);

    expect(roundTrip.css()).toBe(base.css());
    expect(base.css()).toBe('rgb(0 255 0)');
  });
});
