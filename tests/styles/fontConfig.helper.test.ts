import { describe, expect, it } from 'vitest';
import {
  asFontsConfig,
  defineFontFamily,
  type FontsConfig,
  weightRangeFromConfig,
} from '@/styles/helpers/fontConfig.helper';
import { m } from 'css-calipers';

const sampleConfig: FontsConfig = {
  'Sample Family': {
    weights: '300..700',
    axes: {
      wght: '300..700',
      ital: ['0', '1'],
      wdth: '110',
      CASL: '0..1',
    },
  },
};

describe('fontConfig.helper', () => {
  it('merges weight tokens into low/high ranges', () => {
    expect(weightRangeFromConfig('400..800')).toEqual({
      low: 400,
      high: 800,
    });
    expect(
      weightRangeFromConfig(['200..400', '600..700']),
    ).toEqual({ low: 200, high: 700 });
    expect(weightRangeFromConfig([])).toEqual({
      low: 400,
      high: 700,
    });
  });

  it('builds font families using fonts.config axis metadata', () => {
    const family = defineFontFamily({
      familyName: 'Sample Family',
      fallbacks: ['Helvetica', 'sans-serif'],
      cfgMap: sampleConfig,
      spacing: m(0.2, 'rem'),
      offsetToFlushTop: m(0.1, 'rem'),
      weights: { default: 400, strong: 600 },
      css: { letterSpacing: '0.01em' },
      axisDefaults: { GRAD: 0.2 },
    });

    expect(family.family).toBe('"Sample Family", Helvetica, sans-serif');
    expect(family.weights).toEqual({
      low: 300,
      high: 700,
      default: 400,
      strong: 600,
    });
    expect(family.css).toEqual({
      fontStyle: 'normal',
      fontStretch: '110%',
      fontVariationSettings: '"wdth" 110, "CASL" 0.5',
      letterSpacing: '0.01em',
    });
    expect(family.axisDefaults).toEqual({
      wght: 500,
      ital: 0,
      wdth: 110,
      CASL: 0.5,
      GRAD: 0.2,
    });
  });

  it('throws when manual weights conflict with config ranges', () => {
    expect(() =>
      defineFontFamily({
        familyName: 'Sample Family',
        fallbacks: ['sans-serif'],
        cfgMap: sampleConfig,
        spacing: m(0.1, 'rem'),
        offsetToFlushTop: m(0, 'rem'),
        weights: { low: 200, default: 400, strong: 500 },
      }),
    ).toThrow(/conflicts with fonts\.config\.json range/);
  });

  it('coerces raw JSON objects into FontsConfig and validates structure', () => {
    const config = asFontsConfig({
      Urbanist: {
        texts: [42],
        keys: [null],
        weights: ['100..900'],
        ital: 'yes',
        subsets: [123],
        axes: { wght: ['100..900'], CASL: '0..1' },
      },
    });

    expect(config.Urbanist.weights).toEqual(['100..900']);
    expect(config.Urbanist.texts).toEqual(['42']);
    expect(config.Urbanist.keys).toEqual(['null']);
    expect(config.Urbanist.ital).toBeUndefined();
    expect(config.Urbanist.subsets).toEqual(['123']);
    expect(config.Urbanist.axes).toEqual({
      wght: ['100..900'],
      CASL: '0..1',
    });

    expect(() => asFontsConfig(null)).toThrow(/root must be an object/);
  });
});
