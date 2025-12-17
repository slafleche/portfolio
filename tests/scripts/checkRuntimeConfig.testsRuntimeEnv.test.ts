import {
  describe,
  expect,
  it,
} from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { scanRuntimeEnvUsageInTests } from '../../scripts/checkRuntimeConfig.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('runtime env usage rules in tests', () => {
  it('flags direct env usage in test files outside the harness', () => {
    const filePath =
      'tests/example/runtimeEnvBad.test.ts';
    const content = `
      describe('example', () => {
        it('reads NODE_ENV directly', () => {
          expect(process.env.NODE_ENV).toBeDefined();
        });
      });
    `;

    const violations = scanRuntimeEnvUsageInTests(
      filePath,
      content,
    );

    expect(
      violations.some(
        (violation) =>
          violation.rule.id === 'runtime-node-env',
      ),
    ).toBe(true);
  });

  it('allows direct env usage inside the runtimeEnv harness helper', () => {
    const filePath = 'tests/helpers/runtimeEnvHarness.ts';
    const content = readFileSync(
      path.resolve(
        __dirname,
        '../../tests/helpers/runtimeEnvHarness.ts',
      ),
      'utf-8',
    );

    const violations = scanRuntimeEnvUsageInTests(
      filePath,
      content,
    );

    expect(violations.length).toBe(0);
  });

  it('does nothing for non-test paths', () => {
    const filePath = 'src/lib/runtimeEnv.ts';
    const content = `
      if (process.env.NODE_ENV === 'production') {
        console.log('prod');
      }
    `;

    const violations = scanRuntimeEnvUsageInTests(
      filePath,
      content,
    );

    expect(violations.length).toBe(0);
  });
});

