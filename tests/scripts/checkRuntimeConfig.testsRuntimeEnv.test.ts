import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  describe,
  expect,
  it,
} from 'vitest';

import { scanRuntimeEnvUsageInTests } from '../../scripts/checkRuntimeConfig.mjs';
import {
  NON_TEST_NODE_ENV_SNIPPET,
  TEST_FILE_NODE_ENV_SNIPPET,
} from './runtimeEnvScannerFixtures';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('runtime env usage rules in tests', () => {
  it('flags direct env usage in test files outside the harness', () => {
    const filePath =
      'tests/example/runtimeEnvBad.test.ts';
    const content = TEST_FILE_NODE_ENV_SNIPPET;

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
    const content = NON_TEST_NODE_ENV_SNIPPET;

    const violations = scanRuntimeEnvUsageInTests(
      filePath,
      content,
    );

    expect(violations.length).toBe(0);
  });
});
