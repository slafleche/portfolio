import { m, mPercent } from 'css-calipers';
import { describe, expect, it } from 'vitest';

import borders from '@/styles/helpers/borders.helper';
import { color } from '@/styles/helpers/colorWrap.helper';
import { colors, colorVars } from '@/tokens/global.tokens';

describe('borders.helper', () => {
  const red = color('red');
  const redCss = red.css();
  const blue = color('blue');
  const blueCss = blue.css();
  const green = color('green');
  const purple = color('purple');
  const purpleCss = purple.css();

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
      color: red,
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
    expect(result.borderTopColor).toBe(redCss);
    expect(result.borderRightColor).toBe(redCss);
    expect(result.borderBottomColor).toBe(redCss);
    expect(result.borderLeftColor).toBe(redCss);
  });

  it('prefers top-level shorthand for all edges', () => {
    const result = borders({
      width: m(1),
      color: red,
    });
    expect(result.borderTopWidth).toBe('1px');
    expect(result.borderRightWidth).toBe('1px');
    expect(result.borderBottomWidth).toBe('1px');
    expect(result.borderLeftWidth).toBe('1px');
    expect(result.borderTopStyle).toBe('solid');
    expect(result.borderRightStyle).toBe('solid');
    expect(result.borderBottomStyle).toBe('solid');
    expect(result.borderLeftStyle).toBe('solid');
    expect(result.borderTopColor).toBe(redCss);
    expect(result.borderRightColor).toBe(redCss);
    expect(result.borderBottomColor).toBe(redCss);
    expect(result.borderLeftColor).toBe(redCss);
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
      top: { color: blue, width: m(1) },
      right: { color: green, width: m(2) },
      bottom: { color: purple, width: m(3) },
      left: { color: color('#f0f').alpha(0.8), width: m(4) },
      radius: {
        north: m(6),
        east: m(4),
        south: m(0),
      },
    });
    expect(result.borderBottomColor).toBe(purpleCss);
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
      color: red,
      radius: mPercent(50),
    });
    expect(result.borderTopWidth).toBe('1px');
    expect(result.borderRightWidth).toBe('1px');
    expect(result.borderBottomWidth).toBe('1px');
    expect(result.borderLeftWidth).toBe('1px');
    expect(result.borderTopColor).toBe(redCss);
    expect(result.borderRightColor).toBe(redCss);
    expect(result.borderBottomColor).toBe(redCss);
    expect(result.borderLeftColor).toBe(redCss);
    expect(result.borderTopLeftRadius).toBe('50%');
    expect(result.borderTopRightRadius).toBe('50%');
    expect(result.borderBottomRightRadius).toBe('50%');
    expect(result.borderBottomLeftRadius).toBe('50%');
  });

  it('emits rgba output for ColorWrapper borders with alpha', () => {
    const result = borders({
      color: colors.white.alpha(0),
      width: m(2),
    });

    expect(result.borderTopColor).toBe('rgba(255, 255, 255, 0)');
    expect(result.borderRightColor).toBe('rgba(255, 255, 255, 0)');
    expect(result.borderBottomColor).toBe('rgba(255, 255, 255, 0)');
    expect(result.borderLeftColor).toBe('rgba(255, 255, 255, 0)');
  });

  it('emits rgba output for ColorWrapper borders with partial alpha', () => {
    const result = borders({
      color: colors.white.alpha(0.5),
      width: m(2),
    });

    expect(result.borderTopColor).toBe('rgba(255, 255, 255, 0.5)');
    expect(result.borderRightColor).toBe('rgba(255, 255, 255, 0.5)');
    expect(result.borderBottomColor).toBe('rgba(255, 255, 255, 0.5)');
    expect(result.borderLeftColor).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('emits rgb output for ColorWrapper borders without alpha', () => {
    const result = borders({
      color: colors.white,
      width: m(2),
    });

    expect(result.borderTopColor).toBe('rgb(255 255 255)');
    expect(result.borderRightColor).toBe('rgb(255 255 255)');
    expect(result.borderBottomColor).toBe('rgb(255 255 255)');
    expect(result.borderLeftColor).toBe('rgb(255 255 255)');
  });

  it('skips defaults when requested', () => {
    const result = borders(
      {
        all: { color: blue },
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
    expect(result.borderTopColor).toBe(blueCss);
    expect(result.borderRightColor).toBe(blueCss);
    expect(result.borderBottomColor).toBe(blueCss);
    expect(result.borderLeftColor).toBe(blueCss);
  });

  it('treats a two-value radii array as an all-corners shorthand', () => {
    const styles = borders.radii([
      m(40),
      m(60),
    ]);

    expect(styles).toEqual({
      borderTopLeftRadius: '40px 60px',
      borderTopRightRadius: '40px 60px',
      borderBottomRightRadius: '40px 60px',
      borderBottomLeftRadius: '40px 60px',
    });
  });

  it('treats a two-value radii array as an all-corners shorthand in borders(...)', () => {
    const transparent = colors.transparent.css({ forceAlpha: true });
    const styles = borders({
      width: m(0),
      color: colors.transparent,
      radius: [
        m(40),
        m(60),
      ],
    });

    expect(styles.borderTopWidth).toBe('0px');
    expect(styles.borderRightWidth).toBe('0px');
    expect(styles.borderBottomWidth).toBe('0px');
    expect(styles.borderLeftWidth).toBe('0px');
    expect(styles.borderTopColor).toBe(transparent);
    expect(styles.borderRightColor).toBe(transparent);
    expect(styles.borderBottomColor).toBe(transparent);
    expect(styles.borderLeftColor).toBe(transparent);
    expect(styles.borderTopLeftRadius).toBe('40px 60px');
    expect(styles.borderTopRightRadius).toBe('40px 60px');
    expect(styles.borderBottomRightRadius).toBe('40px 60px');
    expect(styles.borderBottomLeftRadius).toBe('40px 60px');
  });

  it('treats a measurement radius as an all-corners shorthand in borders(...)', () => {
    const styles = borders({
      width: m(0),
      color: red,
      radius: m(18),
    });

    expect(styles.borderTopLeftRadius).toBe('18px');
    expect(styles.borderTopRightRadius).toBe('18px');
    expect(styles.borderBottomRightRadius).toBe('18px');
    expect(styles.borderBottomLeftRadius).toBe('18px');
  });

  it('applies compass overrides over all, then corner overrides', () => {
    const styles = borders({
      width: m(0),
      color: red,
      radius: {
        all: m(8),
        north: m(12),
        nw: m(4),
      },
    });

    expect(styles.borderTopLeftRadius).toBe('4px');
    expect(styles.borderTopRightRadius).toBe('12px');
    expect(styles.borderBottomRightRadius).toBe('8px');
    expect(styles.borderBottomLeftRadius).toBe('8px');
  });

  it('accepts per-corner dual-axis radii arrays in borders(...)', () => {
    const styles = borders({
      width: m(0),
      color: red,
      radius: {
        nw: [
          m(12),
          m(24),
        ],
        ne: m(8),
        se: [
          m(4),
          m(6),
        ],
        sw: m(2),
      },
    });

    expect(styles.borderTopLeftRadius).toBe('12px 24px');
    expect(styles.borderTopRightRadius).toBe('8px');
    expect(styles.borderBottomRightRadius).toBe('4px 6px');
    expect(styles.borderBottomLeftRadius).toBe('2px');
  });

  it('keeps explicit corners even when only top edges are active', () => {
    const styles = borders({
      top: { width: m(1), color: red },
      radius: {
        n: [
          m(10),
          m(20),
        ],
        sw: m(4),
      },
    });

    expect(styles.borderTopLeftRadius).toBe('10px 20px');
    expect(styles.borderTopRightRadius).toBe('10px 20px');
    expect(styles.borderBottomRightRadius).toBe('0');
    expect(styles.borderBottomLeftRadius).toBe('4px');
  });

  it('accepts per-corner dual-axis radii arrays', () => {
    const styles = borders.radii({
      sw: [
        m(40),
        m(60),
      ],
    });

    expect(styles).toEqual({
      borderTopLeftRadius: '0',
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
      borderBottomLeftRadius: '40px 60px',
    });
  });

  it('supports north alias + mixed single/dual radii with edge intent', () => {
    const edgeColor = colorVars.white
      .mix(colorVars.bodyBg, 0.5)
      .css();

    const styles = borders({
      horizontal: {
        width: m(1),
        color: edgeColor,
      },
      radius: {
        sw: m(40),
        n: [
          m(50),
          m(10),
        ],
        se: [
          m(30),
          m(40),
        ],
      },
    });

    expect(styles).toEqual({
      borderTopWidth: '0',
      borderRightWidth: '1px',
      borderBottomWidth: '0',
      borderLeftWidth: '1px',
      borderRightStyle: 'solid',
      borderLeftStyle: 'solid',
      borderRightColor: edgeColor,
      borderLeftColor: edgeColor,
      borderTopLeftRadius: '50px 10px',
      borderTopRightRadius: '50px 10px',
      borderBottomRightRadius: '30px 40px',
      borderBottomLeftRadius: '40px',
    });
  });

  it('forces all corners when output true even for zero radius', () => {
    const styles = borders.radii(m(0), { output: true });

    expect(styles).toEqual({
      borderTopLeftRadius: '0',
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
      borderBottomLeftRadius: '0',
    });
  });

  it('keeps current behavior when output false', () => {
    const styles = borders.radii(m(0), { output: false });

    expect(styles).toEqual({});
  });

  it('forces only selected corners when output flags are provided', () => {
    const styles = borders.radii(
      {
        north: m(4),
        south: m(0),
      },
      {
        output: {
          nw: false,
          ne: false,
          se: false,
          sw: true,
        },
      },
    );

    expect(styles.borderTopLeftRadius).toBeUndefined();
    expect(styles.borderTopRightRadius).toBeUndefined();
    expect(styles.borderBottomRightRadius).toBeUndefined();
    expect(styles.borderBottomLeftRadius).toBe('0');
  });

  it('accepts partial output flags without specifying every corner', () => {
    const styles = borders.radii(
      {
        north: m(4),
        south: m(0),
      },
      {
        output: {
          sw: true,
        },
      },
    );

    expect(styles.borderTopLeftRadius).toBeUndefined();
    expect(styles.borderTopRightRadius).toBeUndefined();
    expect(styles.borderBottomRightRadius).toBeUndefined();
    expect(styles.borderBottomLeftRadius).toBe('0');
  });

  it('does not change current output when all output flags are false', () => {
    const base = borders.radii({
      nw: m(8),
    });
    const styles = borders.radii(
      {
        nw: m(8),
      },
      {
        output: {
          nw: false,
          ne: false,
          se: false,
          sw: false,
        },
      },
    );

    expect(styles).toEqual(base);
  });
});
