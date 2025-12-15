import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { scanBordersRadiiShorthand } from '../../scripts/checkLintRules.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('checkLintRules radii shorthand rule', () => {
  it('flags borders.radii calls that wrap borderVars.radius in an object', () => {
    const filePath = 'src/styles/components/example.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import { borders } from '../helpers/borders.helper';
      import { borderVars } from '../../tokens/global.tokens';

      export const example = style({
        ...borders.radii({
          all: borderVars.radius,
        }),
      });
    `;

    const violations = scanBordersRadiiShorthand(filePath, content);
    expect(violations.length).toBe(1);
    expect(violations[0]?.rule.id).toBe('borders-radii-shorthand');
  });

  it('does not flag borders.radii when using a shared border config directly', () => {
    const filePath = 'src/styles/components/exampleOk.css.ts';
    const content = `
      import { style } from '@vanilla-extract/css';
      import borders from '../helpers/borders.helper';
      import { glassVars } from '../../tokens/glassy.tokens';

      export const exampleOk = style({
        ...borders.radii(glassVars.borders),
      });
    `;

    const violations = scanBordersRadiiShorthand(filePath, content);
    expect(violations.length).toBe(0);
  });

  it('ignores non-style files', () => {
    const filePath = 'src/tokens/someConfig.ts';
    const content = readFileSync(
      path.resolve(__dirname, '../../src/tokens/global.tokens.ts'),
      'utf-8',
    );

    const violations = scanBordersRadiiShorthand(filePath, content);
    expect(violations.length).toBe(0);
  });
});

