import { describe, expect, it } from 'vitest';
import { m } from 'css-calipers';
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

  it('treats modifier scale as full-range in OKLCH', () => {
    const lightened = color('#123456').lighten(1).value().rgb(false);
    lightened.forEach((channel) => {
      expect(channel).toBeGreaterThanOrEqual(254);
    });

    const darkened = color('#abcdef').darken(1).value().rgb(false);
    darkened.forEach((channel) => {
      expect(channel).toBeLessThanOrEqual(1);
    });
  });

  it('desaturate(1) produces grayscale', () => {
    const [r, g, b] = color('#E03035').desaturate(1).value().rgb(false);
    expect(Math.abs(r - g)).toBeLessThanOrEqual(1);
    expect(Math.abs(g - b)).toBeLessThanOrEqual(1);
    expect(Math.abs(r - b)).toBeLessThanOrEqual(1);
  });

  it('hueShift rotates hue while preserving alpha', () => {
    const base = color('#ff0000').alpha(0.4);
    const shifted = base.hueShift(m(120, 'deg'));

    const baseOklch = color.toOKLCH(base);
    const shiftedOklch = color.toOKLCH(shifted);
    const circularDiff = (a: number, b: number) => {
      const diff = Math.abs(a - b) % 360;
      return diff > 180 ? 360 - diff : diff;
    };

    expect(base.css()).toBe('rgb(255 0 0 / 0.4)');
    expect(baseOklch).toBeDefined();
    expect(shiftedOklch).toBeDefined();
    const expectedHue =
      ((baseOklch!.h ?? 0) + 120 + 360) % 360;
    expect(
      circularDiff(shiftedOklch!.h ?? 0, expectedHue),
    ).toBeLessThanOrEqual(10);
    expect(shifted.alpha()).toBeCloseTo(0.4);
  });

  it('hueShift wraps hue for negative degrees', () => {
    const base = color('#00ff00');
    const shifted = base.hueShift(m(-120, 'deg'));
    const baseOklch = color.toOKLCH(base);
    const shiftedOklch = color.toOKLCH(shifted);
    const circularDiff = (a: number, b: number) => {
      const diff = Math.abs(a - b) % 360;
      return diff > 180 ? 360 - diff : diff;
    };

    expect(baseOklch).toBeDefined();
    expect(shiftedOklch).toBeDefined();
    const expectedHue =
      ((baseOklch!.h ?? 0) - 120 + 360) % 360;
    expect(
      circularDiff(shiftedOklch!.h ?? 0, expectedHue),
    ).toBeLessThanOrEqual(10);
  });
});
