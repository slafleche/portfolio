import { m, mPercent } from 'css-calipers';
import { describe, expect, it } from 'vitest';

import { color } from '@/styles/helpers/colorWrap.helper';
import { easing } from '@/styles/helpers/easingCurves.helper';
import {
  buildLinear,
  buildRadial,
  gradientAsBgImg,
  maskByLinearGradient,
  OKLCH_SUPPORTS,
  resolveGradientSpotStops,
  resolveLinearAngle,
  stackBackground,
} from '@/styles/helpers/gradients.helper';

const stops = [
  {
    color: color('#ff0000'),
    at: mPercent(0),
  },
  { color: color('#00ff00'), at: mPercent(50) },
  { color: color('#0000ff'), at: mPercent(100) },
];

describe('gradients.helper', () => {
  it('resolves degree + coordinate directions', () => {
    expect(resolveLinearAngle().css()).toBe('90deg');
    expect(resolveLinearAngle(m(45, 'deg')).css()).toBe('45deg');

    const angle = resolveLinearAngle({
      from: { x: m(0), y: m(0) },
      to: { x: m(1), y: m(0) },
    });
    expect(angle.css()).toBe('90deg');
  });

  it('builds linear gradients with modern/fallback layers', () => {
    const gradient = buildLinear({
      angle: m(30, 'deg'),
      globalAlpha: 0.5,
      stops,
    });

    expect(gradient.fallback).toMatch(
      /^linear-gradient\(30deg, .*0%, .*50%, .*100%\)$/,
    );
    expect(gradient.fallback).toContain('/ 0.5)');
    expect(gradient.modern).toContain('oklch(');
  });

  it('clamps and rounds angles and stop positions', () => {
    const gradient = buildLinear({
      angle: m(33.3333, 'deg'),
      globalAlpha: 0.123456,
      stops: [
        { color: color('#ff0000'), at: mPercent(-5) },
        { color: color('#00ff00'), at: mPercent(33.3333) },
        { color: color('#0000ff'), at: mPercent(150.5555) },
      ],
    });

    expect(
      gradient.fallback.startsWith('linear-gradient(33.33deg,'),
    ).toBe(true);
    expect(gradient.fallback).toContain('0%');
    expect(gradient.fallback).toContain('33.33%');
    expect(gradient.fallback).toContain('100%');
    expect(gradient.fallback).toContain('/ 0.123');
  });

  it('builds radial gradients and stacks layers', () => {
    const radialOptions = {
      shape: 'circle',
      size: 'closest-side',
      at: '25% 40%',
      stops,
    } as const;
    const radial = buildRadial(radialOptions);

    expect(radial.fallback).toContain(
      'radial-gradient(circle closest-side at 25% 40%',
    );
    expect(radial.modern).toContain('oklch(');

    const linearOptions = {
      angle: m(45, 'deg'),
      stops,
    } as const;
    const linear = buildLinear(linearOptions);

    const stacked = stackBackground([
      {
        kind: 'linear',
        options: linearOptions,
      },
      { kind: 'radial', options: radialOptions },
    ]);

    expect(stacked.fallback).toBe(
      `${linear.fallback}, ${radial.fallback}`,
    );
    const [
      firstLayer,
      secondLayer,
    ] = stacked.fallback.split('), ');
    expect(firstLayer.startsWith('linear-gradient(')).toBe(true);
    expect(secondLayer.startsWith('radial-gradient(')).toBe(true);
    expect(stacked.modern).toContain('linear-gradient');
    expect(stacked.modern).toContain('radial-gradient');
  });

  it('collapses identical background layers to a single value', () => {
    const linear = buildLinear({ stops });
    const stacked = stackBackground([
      { kind: 'linear', options: { stops } },
      { kind: 'linear', options: { stops } },
    ]);

    expect(stacked.fallback).toBe(linear.fallback);
    expect(stacked.modern).toBe(linear.modern);
  });

  it('generates deterministic spot stop curves and respects presets', () => {
    const curve = resolveGradientSpotStops('soft');
    expect(curve).toHaveLength(5);
    expect(curve[0]).toEqual({ at: 0, alpha: 1 });
    expect(curve[curve.length - 1]).toEqual({ at: 100, alpha: 0 });

    const tightCurve = resolveGradientSpotStops({
      count: 2,
      maxAlpha: 1,
      minAlpha: 0,
      easing: easing.linear,
      positions: [
        0.123456,
        0.987654,
      ],
    });
    expect(tightCurve).toEqual([
      { at: 12.35, alpha: 0.877 },
      { at: 98.77, alpha: 0.012 },
    ]);

    const explicit = resolveGradientSpotStops([
      { at: 0, alpha: 1 },
      { at: 50, alpha: 0.5 },
    ]);
    expect(explicit).toEqual([
      { at: 0, alpha: 1 },
      { at: 50, alpha: 0.5 },
    ]);
  });

  it('emits non-OKLCH fallback with an OKLCH @supports upgrade', () => {
    const gradient = buildLinear({
      angle: m(30, 'deg'),
      stops,
    });
    const bgImages = gradientAsBgImg(gradient);

    expect(bgImages.backgroundImage).not.toContain('oklch(');
    const supports =
      '@supports' in bgImages ? bgImages['@supports'] : undefined;
    expect(supports).toBeDefined();
    if (!supports) {
      throw new Error('Expected @supports for OKLCH fallback');
    }
    expect(
      supports[OKLCH_SUPPORTS].backgroundImage,
    ).toContain('oklch(');
  });

  it('combines multi-layer fallback with an OKLCH upgrade', () => {
    const layered = stackBackground([
      { kind: 'linear', options: { stops } },
      { kind: 'radial', options: { stops } },
    ]);
    const bgImages = gradientAsBgImg(layered);

    expect(bgImages.backgroundImage).toContain('), ');
    expect(bgImages.backgroundImage).not.toContain('oklch(');
    const supports =
      '@supports' in bgImages ? bgImages['@supports'] : undefined;
    expect(supports).toBeDefined();
    if (!supports) {
      throw new Error('Expected @supports for OKLCH fallback');
    }
    expect(
      supports[OKLCH_SUPPORTS].backgroundImage,
    ).toContain('), ');
    expect(
      supports[OKLCH_SUPPORTS].backgroundImage,
    ).toContain('oklch(');
  });

  it('skips OKLCH @supports when gradients contain no oklch colors', () => {
    const built = {
      fallback: 'linear-gradient(90deg, #000 0%, #fff 100%)',
      modern: 'linear-gradient(90deg, #000 0%, #fff 100%)',
    };
    const bgImages = gradientAsBgImg(built);
    expect('@supports' in bgImages).toBe(false);
  });

  it('emits mask styles with mask + webkit branches', () => {
    const styles = maskByLinearGradient({
      angle: m(225, 'deg'),
      stops: [
        {
          color: color('#000').alpha(0),
          at: mPercent(49),
        },
        {
          color: color('#000').alpha(1),
          at: mPercent(53),
        },
      ],
    });
    expect(styles.mask).toBeDefined();
    expect(styles.WebkitMask).toBeDefined();
  });

  it('accepts explicit mask and webkit mask gradients', () => {
    const mask = 'linear-gradient(225deg, transparent 49%, #000 53%)';
    const styles = maskByLinearGradient({
      angle: m(225, 'deg'),
      stops: [
        {
          color: color('#000').alpha(0),
          at: mPercent(49),
        },
        {
          color: color('#000').alpha(1),
          at: mPercent(53),
        },
      ],
    });
    expect(styles.mask).toBe(mask);
    expect(styles.WebkitMask).toBe(mask);
  });
});
