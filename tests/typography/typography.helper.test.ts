import { describe, expect, it } from 'vitest';
import {
  composeFontStyles,
  computeFontWeight,
  fontStyles,
  fontWeightStyle,
  relativeFontWeight,
} from '@/styles/helpers/typography.helper';
import { fontStylesFromFontVariant } from '@/styles/helpers/fontVariant.helper';
import { fontFamilies } from '@/tokens/fontFamilies.tokens';
import { typographyFontVariants } from '@/tokens/fontVariants/typography';
import { m, mPercent } from 'css-calipers';

describe('typography.helper', () => {
  it('normalizes FontStyles into CSS-ready properties', () => {
    const styles = fontStyles({
      fontFamily: 'IBM Plex Sans',
      size: m(18),
      letterSpacing: m(0.5),
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
    const relative = relativeFontWeight(family, percent).fontWeight;
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
        letterSpacing: m(1),
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

  it('applies letterSpacing from options in composeFontStyles', () => {
    const family = fontFamilies.ibm;
    const result = composeFontStyles(family, {
      options: {
        letterSpacing: m(0.05, 'em'),
      },
    });

    expect(result.letterSpacing).toBe('0.05em');
  });

  it('prefers overrides over options for letterSpacing', () => {
    const family = fontFamilies.ibm;
    const result = composeFontStyles(family, {
      options: {
        letterSpacing: m(0.05, 'em'),
      },
      overrides: {
        letterSpacing: m(0.1, 'em'),
      },
    });

    expect(result.letterSpacing).toBe('0.1em');
  });

  it('keeps heading defaults when merging h1 styles', () => {
    const headingStyles = fontStylesFromFontVariant({
      variant: typographyFontVariants.heading,
    });
    const h1Styles = fontStylesFromFontVariant({
      variant: typographyFontVariants.h1,
    });
    const merged = { ...headingStyles, ...h1Styles };

    expect(merged.textAlign).toBe('center');
    expect(merged.fontSize).toBeDefined();
  });

  it('keeps heading defaults when merging h2 styles', () => {
    const headingStyles = fontStylesFromFontVariant({
      variant: typographyFontVariants.heading,
    });
    const h2Styles = fontStylesFromFontVariant({
      variant: typographyFontVariants.h2,
    });
    const merged = { ...headingStyles, ...h2Styles };

    expect(merged.textAlign).toBe('center');
  });

  it('includes letterSpacing from heading variant options', () => {
    const headingStyles = fontStylesFromFontVariant({
      variant: typographyFontVariants.heading,
    });

    expect(headingStyles.letterSpacing).toBe('0.05em');
  });

  it('inherits family defaults through heading and h1/h2 variants', () => {
    const family = fontFamilies.objectSans;
    const headingStyles = fontStylesFromFontVariant({
      variant: typographyFontVariants.heading,
    });
    const h1Styles = fontStylesFromFontVariant({
      variant: typographyFontVariants.h1,
      baseVariant: typographyFontVariants.heading,
    });
    const h2Styles = fontStylesFromFontVariant({
      variant: typographyFontVariants.h2,
      baseVariant: typographyFontVariants.heading,
    });

    expect(headingStyles.fontFamily).toBe(family.family);
    expect(headingStyles.lineHeight).toBe(family.lineHeight);
    expect(headingStyles.letterSpacing).toBe('0.05em');
    expect(h1Styles.lineHeight).toBe(family.lineHeight);
    expect(h2Styles.lineHeight).toBe(family.lineHeight);
    expect(h1Styles.letterSpacing).toBe(headingStyles.letterSpacing);
    expect(h2Styles.letterSpacing).toBe(headingStyles.letterSpacing);

    const expectedWeight = computeFontWeight(
      family,
      mPercent(100),
    );
    expect(headingStyles.fontWeight).toBe(expectedWeight);
    expect(h1Styles.fontWeight).toBe(expectedWeight);
    expect(h2Styles.fontWeight).toBe(expectedWeight);
  });

  it('allows overrides at the variant and extraConfig layers', () => {
    const h1Base = fontStylesFromFontVariant({
      variant: typographyFontVariants.h1,
      baseVariant: typographyFontVariants.heading,
    });
    const h1Override = fontStylesFromFontVariant({
      variant: typographyFontVariants.h1,
      baseVariant: typographyFontVariants.heading,
      extraConfig: {
        options: {
          textAlign: 'left',
          letterSpacing: m(0.1, 'em'),
        },
        overrides: {
          lineHeight: 2,
        },
      },
    });

    expect(h1Base.textAlign).toBe('center');
    expect(h1Override.textAlign).toBe('left');
    expect(h1Override.letterSpacing).toBe('0.1em');
    expect(h1Override.lineHeight).toBe(2);
  });
});
