import { describe, expect, it } from 'vitest';
import {
  buildCurve,
  easing,
} from '@/styles/helpers/easingCurves.helper';

describe('easingCurves.helper', () => {
  it('clamps easing domain and provides expected curves', () => {
    expect(easing.linear(1.2)).toBe(1);
    expect(easing.linear(-0.5)).toBe(0);

    expect(easing.easeOutQuad(0.5)).toBeCloseTo(0.75, 5);
    expect(easing.easeOutCubic(0.5)).toBeCloseTo(0.875, 5);
    expect(easing.powerDecay(2)(0.5)).toBeCloseTo(0.75, 5);
  });

  it('builds deterministic curves from explicit positions', () => {
    const samples = buildCurve({
      positions: [
        0.9,
        0.5,
        -0.2,
        0.25,
      ],
      min: 10,
      max: 20,
      easing: easing.easeOutQuad,
    });

    expect(samples).toEqual([
      {
        position: 0,
        value: 10,
      },
      { position: 0.25, value: 14.375 },
      { position: 0.5, value: 17.5 },
      { position: 0.9, value: 19.9 },
    ]);
  });

  it('derives evenly spaced samples when positions omitted', () => {
    const samples = buildCurve({
      samples: 4,
      includeZero: false,
      includeOne: false,
      easing: easing.linear,
    });

    expect(samples).toEqual([
      {
        position: 0.2,
        value: 0.2,
      },
      { position: 0.3333, value: 0.3333 },
      { position: 0.4667, value: 0.4667 },
      { position: 0.6, value: 0.6 },
    ]);
  });
});
