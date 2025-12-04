import { describe, expect, it } from 'vitest';
import borders from '@/styles/helpers/borders.helper';
import { m } from 'css-calipers';
import { color } from '@/styles/helpers/colorWrap.helper';
import { colorVars } from '@/tokens/global.tokens';

describe('borders.helper', () => {
  it('returns defaults for all edges when enabled', () => {
    const result = borders({ all: true });
    expect(result.borderWidth).toBe('4px');
    expect(result.borderStyle).toBe('solid');
    expect(result.borderColor).toBe(colorVars.border.css());
  });

  it('merges shorthand width/color/style overrides', () => {
    const result = borders({
      width: m(2),
      color: 'red',
      style: 'dashed',
      left: { width: m(0) },
    });
    expect(result.borderWidth).toBe('2px 2px 2px 0px');
    expect(result.borderStyle).toBe('dashed');
    expect(result.borderColor).toBe('red');
  });

  it('resolves radius-only intents when allowed', () => {
    const result = borders(
      { radius: { nw: m(8), ne: m(8) } },
      { allowRadiusOnly: true },
    );
    expect(result).toEqual({ borderRadius: '8px 8px 0 0' });
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
    expect(result.borderRadius).toBe('6px 4px 4px 0px');
    expect(result.borderWidth).toBe('1px 2px 3px 4px');
  });
});
