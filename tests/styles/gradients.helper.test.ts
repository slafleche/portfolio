import { describe, expect, it } from 'vitest';
import {
  buildLinear,
  buildRadial,
  resolveGradientSpotStops,
  resolveLinearAngle,
  stackBackground,
} from '@/styles/helpers/gradients.helper';
import { m, mPercent } from 'css-calipers';

const stops = [
  { color: '#ff0000', at: mPercent(0) },
  { color: '#00ff00', at: mPercent(50) },
  { color: '#0000ff', at: mPercent(100) },
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

  it('builds radial gradients and stacks layers', () => {
    const radial = buildRadial({
      shape: 'circle',
      size: 'closest-side',
      at: '25% 40%',
      stops,
    });

    expect(radial.fallback).toContain(
      'radial-gradient(circle closest-side at 25% 40%',
    );
    expect(radial.modern).toContain('oklch(');

    const stacked = stackBackground([
      { kind: 'linear', options: { stops } },
      { kind: 'radial', options: { stops } },
    ]);

    const [firstLayer, secondLayer] = stacked.fallback.split('), ');
    expect(firstLayer.startsWith('linear-gradient(')).toBe(true);
    expect(secondLayer.startsWith('radial-gradient(')).toBe(true);
    expect(stacked.modern).toContain('linear-gradient');
    expect(stacked.modern).toContain('radial-gradient');
  });

  it('generates deterministic spot stop curves and respects presets', () => {
    const curve = resolveGradientSpotStops('soft');
    expect(curve).toHaveLength(5);
    expect(curve[0]).toEqual({ at: 0, alpha: 1 });
    expect(curve[curve.length - 1]).toEqual({ at: 100, alpha: 0 });

    const explicit = resolveGradientSpotStops([
      { at: 0, alpha: 1 },
      { at: 50, alpha: 0.5 },
    ]);
    expect(explicit).toEqual([
      { at: 0, alpha: 1 },
      { at: 50, alpha: 0.5 },
    ]);
  });
});
