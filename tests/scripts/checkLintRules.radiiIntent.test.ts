import { describe, expect, it } from 'vitest';
import { scanBordersRadiiIntent } from '../../scripts/checkLintRules.mjs';

describe('checkLintRules radii intent rule', () => {
  it('flags redundant radius intents (all + others, overlapping regions/corners)', () => {
    const filePath = 'src/styles/components/exampleRadii.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import borders from '../helpers/borders.helper';
      import { m } from 'css-calipers';

      export const example = style({
        ...borders.radii({
          radius: {
            all: m(8),
            north: m(8),
            ne: m(8),
            se: m(8),
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBe(1);
    expect(violations[0]?.rule.id).toBe(
      'borders-radii-intent-redundant',
    );
  });

  it('flags use of radius shorthand plus all edge intent in borders(...) calls', () => {
    const filePath = 'src/styles/components/mockEndHTML.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import { borders } from '../helpers/borders.helper';
      import { m, mPercent } from 'css-calipers';

      export const hint = style({
        ...borders({
          radius: mPercent(50),
          all: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBe(1);
    expect(violations[0]?.rule.id).toBe(
      'borders-radii-intent-redundant',
    );
  });

  it('flags radius: { all: ... } inside borders(...) calls in component styles', () => {
    const filePath =
      'src/styles/components/exampleBorderAllRadius.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import { borders } from '../helpers/borders.helper';
      import { m, mPercent } from 'css-calipers';

      export const example = style({
        ...borders({
          radius: {
            all: mPercent(50),
          },
          all: {
            width: m(1),
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBe(1);
    expect(violations[0]?.rule.id).toBe(
      'borders-radii-intent-redundant',
    );
  });

  it('does not flag radius intents without redundant combinations', () => {
    const filePath = 'src/styles/components/exampleRadiiOk.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import borders from '../helpers/borders.helper';
      import { m } from 'css-calipers';

      export const exampleOk = style({
        ...borders.radii({
          radius: {
            north: m(8),
            south: m(4),
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBe(0);
  });

  it('ignores token/config-style paths via STYLE_RULE_SKIP_PATHS', () => {
    const filePath = 'src/tokens/someRadiusConfig.ts';
    const content = `
      import borders from '../styles/helpers/borders.helper';

      export const radiusPreset = borders.radii({
        radius: { all: m(8) },
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBe(0);
  });

  it('flags redundant border axis combinations (vertical + horizontal with same border)', () => {
    const filePath = 'src/styles/components/exampleBorderAxes.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import { borders } from '../helpers/borders.helper';
      import { m } from 'css-calipers';

      export const example = style({
        ...borders({
          vertical: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
          horizontal: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBeGreaterThan(0);
  });

  it('flags redundant side combinations (left + right with same border)', () => {
    const filePath =
      'src/styles/components/exampleBorderSides.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import { borders } from '../helpers/borders.helper';
      import { m } from 'css-calipers';

      export const example = style({
        ...borders({
          left: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
          right: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBeGreaterThan(0);
  });

  it('flags redundant side combinations (top + bottom with same border)', () => {
    const filePath =
      'src/styles/components/exampleBorderSides.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import { borders } from '../helpers/borders.helper';
      import { m } from 'css-calipers';

      export const example = style({
        ...borders({
          top: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
          bottom: {
            width: m(1),
            color: 'rgba(255, 255, 255, 0.1)',
          },
        }),
      });
    `;

    const violations = scanBordersRadiiIntent(filePath, content);
    expect(violations.length).toBeGreaterThan(0);
  });
});
