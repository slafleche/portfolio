import { m, mPercent } from 'css-calipers';
import { describe, expect, it } from 'vitest';

import { color } from '@/styles/helpers/colorWrap.helper';
import { colorVars } from '@/tokens/global.tokens';

import borders from '../../src/styles/helpers/borders.helper';

describe('borders.helper', () => {
  it('returns defaults for all edges when enabled', () => {
    const result = borders.defaults();
    expect(result.borderTopWidth).toBe('4px');
    expect(result.borderRightWidth).toBe('4px');
    expect(result.borderBottomWidth).toBe('4px');
    expect(result.borderLeftWidth).toBe('4px');
    expect(result.borderTopStyle).toBe('solid');
    expect(result.borderRightStyle).toBe('solid');
    expect(result.borderBottomStyle).toBe('solid');
    expect(result.borderLeftStyle).toBe('solid');
    expect(result.borderTopColor).toBe(colorVars.border.css());
    expect(result.borderRightColor).toBe(colorVars.border.css());
    expect(result.borderBottomColor).toBe(colorVars.border.css());
    expect(result.borderLeftColor).toBe(colorVars.border.css());
  });

  it('merges shorthand width/color/style overrides', () => {
    const result = borders({
      width: m(2),
      color: 'red',
      style: 'dashed',
      left: { width: m(0) },
    });
    expect(result.borderTopWidth).toBe('2px');
    expect(result.borderRightWidth).toBe('2px');
    expect(result.borderBottomWidth).toBe('2px');
    expect(result.borderLeftWidth).toBe('0px');
    expect(result.borderTopStyle).toBe('dashed');
    expect(result.borderRightStyle).toBe('dashed');
    expect(result.borderBottomStyle).toBe('dashed');
    expect(result.borderLeftStyle).toBe('dashed');
    expect(result.borderTopColor).toBe('red');
    expect(result.borderRightColor).toBe('red');
    expect(result.borderBottomColor).toBe('red');
    expect(result.borderLeftColor).toBe('red');
  });

  it('prefers top-level shorthand for all edges', () => {
    const result = borders({
      width: m(1),
      color: 'red',
    });
    expect(result.borderTopWidth).toBe('1px');
    expect(result.borderRightWidth).toBe('1px');
    expect(result.borderBottomWidth).toBe('1px');
    expect(result.borderLeftWidth).toBe('1px');
    expect(result.borderTopStyle).toBe('solid');
    expect(result.borderRightStyle).toBe('solid');
    expect(result.borderBottomStyle).toBe('solid');
    expect(result.borderLeftStyle).toBe('solid');
    expect(result.borderTopColor).toBe('red');
    expect(result.borderRightColor).toBe('red');
    expect(result.borderBottomColor).toBe('red');
    expect(result.borderLeftColor).toBe('red');
  });

  it('resolves radius-only intents when allowed', () => {
    const result = borders.radii({
      radius: { nw: m(8), ne: m(8) },
    });
    expect(result).toEqual({
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '0',
      borderBottomLeftRadius: '0',
    });
  });

  it('accepts radius shorthand without the radius wrapper', () => {
    const result = borders.radii(m(12));
    expect(result).toEqual({
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomRightRadius: '12px',
      borderBottomLeftRadius: '12px',
    });
  });

  it('accepts corner shorthand without the radius wrapper', () => {
    const result = borders.radii({
      nw: m(8),
      ne: m(8),
      sw: m(4),
    });
    expect(result).toEqual({
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '0',
      borderBottomLeftRadius: '4px',
    });
  });

  it('accepts per-edge color + radius details', () => {
    const result = borders({
      top: { color: 'blue', width: m(1) },
      right: { color: 'green', width: m(2) },
      bottom: { color: 'purple', width: m(3) },
      left: { color: color('#f0f').alpha(0.8), width: m(4) },
      radius: {
        north: m(6),
        east: m(4),
        south: m(0),
      },
    });
    expect(result.borderBottomColor).toBe('purple');
    expect(result.borderTopLeftRadius).toBe('6px');
    expect(result.borderTopRightRadius).toBe('4px');
    expect(result.borderBottomRightRadius).toBe('4px');
    expect(result.borderBottomLeftRadius).toBe('0px');
    expect(result.borderTopWidth).toBe('1px');
    expect(result.borderRightWidth).toBe('2px');
    expect(result.borderBottomWidth).toBe('3px');
    expect(result.borderLeftWidth).toBe('4px');
  });

  it('keeps uniform radius when provided as a measurement shorthand', () => {
    const result = borders({
      width: m(1),
      color: 'red',
      radius: mPercent(50),
    });
    expect(result.borderTopWidth).toBe('1px');
    expect(result.borderRightWidth).toBe('1px');
    expect(result.borderBottomWidth).toBe('1px');
    expect(result.borderLeftWidth).toBe('1px');
    expect(result.borderTopColor).toBe('red');
    expect(result.borderRightColor).toBe('red');
    expect(result.borderBottomColor).toBe('red');
    expect(result.borderLeftColor).toBe('red');
    expect(result.borderTopLeftRadius).toBe('50%');
    expect(result.borderTopRightRadius).toBe('50%');
    expect(result.borderBottomRightRadius).toBe('50%');
    expect(result.borderBottomLeftRadius).toBe('50%');
  });

  it('skips defaults when requested', () => {
    const result = borders(
      {
        all: { color: 'blue' },
      },
      { skipDefaults: true },
    );
    expect(result.borderTopWidth).toBeUndefined();
    expect(result.borderRightWidth).toBeUndefined();
    expect(result.borderBottomWidth).toBeUndefined();
    expect(result.borderLeftWidth).toBeUndefined();
    expect(result.borderTopStyle).toBeUndefined();
    expect(result.borderRightStyle).toBeUndefined();
    expect(result.borderBottomStyle).toBeUndefined();
    expect(result.borderLeftStyle).toBeUndefined();
    expect(result.borderTopColor).toBe('blue');
    expect(result.borderRightColor).toBe('blue');
    expect(result.borderBottomColor).toBe('blue');
    expect(result.borderLeftColor).toBe('blue');
  });
});
