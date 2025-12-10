import { describe, expect, it } from 'vitest';
import {
  composeFontStyles,
  computeFontWeight,
  fontStyles,
  fontWeightStyle,
  relativeFontWeight,
} from '@/styles/helpers/typography.helper';
import { fontFamilies } from '@/tokens/fontFamilies.tokens';
import { m, mPercent } from 'css-calipers';

describe('typography.helper', () => {
  it('normalizes FontStyles into CSS-ready properties', () => {
    const styles = fontStyles({
      fontFamily: 'IBM Plex Sans',
      size: m(18),
      spacing: m(0.5),
      lineHeight: 1.5,
      fontWeight: 600,
      css: {
        fontFeatureSettings: '"liga" 1',
      },
    });

    expect(styles).toEqual(
      expect.objectContaining({
        fontFamily: 'IBM Plex Sans',
        fontSize: '18px',
        letterSpacing: '0.5px',
        lineHeight: 1.5,
        fontWeight: 600,
        fontFeatureSettings: '"liga" 1',
      }),
    );
  });

  it('computes relative font weights from percent measurements', () => {
    const family = fontFamilies.ibm;
    const percent = mPercent(75);
    const relative = relativeFontWeight(family, percent);
    const computed = computeFontWeight(family, percent);
    expect(relative).toBe(computed);
    expect(relative).toBeGreaterThan(family.weights.default);
    expect(relative).toBeLessThanOrEqual(family.weights.strong);

    const style = fontWeightStyle(family, percent);
    expect(style.fontWeight).toBe(relative);
  });

  it('composes layered font styles with overrides and weight percents', () => {
    const family = fontFamilies.ibm;
    const result = composeFontStyles(family, {
      layers: [
        {
          size: m(20),
          css: { fontStyle: 'italic' },
        },
      ],
      overrides: {
        spacing: m(1),
      },
      options: {
        weightPercents: {
          default: mPercent(60),
          strong: mPercent(90),
        },
      },
    });

    expect(result.fontSize).toBe('20px');
    expect(result.letterSpacing).toBe('1px');
    expect(result.fontStyle).toBe('italic');
    expect(result.fontWeight).toBeGreaterThan(family.weights.default);
  });
});
