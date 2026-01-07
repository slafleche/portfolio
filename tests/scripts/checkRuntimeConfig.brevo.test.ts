import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  describe,
  expect,
  it,
} from 'vitest';

import { scanBrevoEnvUsage } from '../../scripts/checkRuntimeConfig.mjs';
import {
  BREVO_DIRECT_SNIPPET,
  BREVO_VARIANTS_SNIPPET,
} from './runtimeEnvScannerFixtures';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Brevo env usage rules', () => {
  it('flags direct Brevo env usage for all four keys', () => {
    const filePath = 'src/server/exampleBrevo.ts';
    const content = BREVO_DIRECT_SNIPPET;

    const violations = scanBrevoEnvUsage(filePath, content);
    const ids = violations.map((violation) => violation.rule.id);

    expect(ids).toContain('brevo-api-key');
    expect(ids).toContain('brevo-mail-from');
    expect(ids).toContain('brevo-mail-to');
    expect(ids).toContain('brevo-subject-prefix');
  });

  it('flags common Brevo env variants (optional chaining + bracket)', () => {
    const filePath = 'src/server/exampleBrevoVariants.ts';
    const content = BREVO_VARIANTS_SNIPPET;

    const violations = scanBrevoEnvUsage(filePath, content);
    const ids = violations.map((violation) => violation.rule.id);

    expect(ids.filter((id) => id === 'brevo-api-key').length).toBe(4);
    expect(ids.filter((id) => id === 'brevo-mail-from').length).toBe(4);
    expect(ids.filter((id) => id === 'brevo-mail-to').length).toBe(4);
    expect(ids.filter((id) => id === 'brevo-subject-prefix').length).toBe(4);
  });

  it('does not flag Brevo env usage inside runtimeEnv helper itself', () => {
    const filePath = 'src/lib/runtimeEnv.ts';
    const content = readFileSync(
      path.resolve(__dirname, '../../src/lib/runtimeEnv.ts'),
      'utf-8',
    );

    const violations = scanBrevoEnvUsage(filePath, content);
    expect(violations.length).toBe(0);
  });
});
