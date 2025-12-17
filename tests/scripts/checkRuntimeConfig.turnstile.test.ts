import {
  describe,
  expect,
  it,
} from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { scanTurnstileEnvUsage } from '../../scripts/checkRuntimeConfig.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Turnstile env usage rules', () => {
  it('flags direct NEXT_PUBLIC_TURNSTILE_SITE_KEY usage', () => {
    const filePath = 'src/example/turnstileSiteKey.tsx';
    const content = `
      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      console.log(siteKey);
    `;

    const violations = scanTurnstileEnvUsage(filePath, content);
    expect(violations.length).toBe(1);
    expect(violations[0]?.rule.id).toBe('turnstile-site-key');
  });

  it('flags common NEXT_PUBLIC_TURNSTILE_SITE_KEY variants (optional chaining + bracket)', () => {
    const filePath = 'src/example/turnstileSiteKeyVariants.tsx';
    const content = `
      const a = process.env['NEXT_PUBLIC_TURNSTILE_SITE_KEY'];
      const b = process?.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      const c = process.env?.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      const d = process?.env?.['NEXT_PUBLIC_TURNSTILE_SITE_KEY'];
    `;

    const violations = scanTurnstileEnvUsage(filePath, content);
    const siteKeyViolations = violations.filter(
      (violation) => violation.rule.id === 'turnstile-site-key',
    );

    expect(siteKeyViolations.length).toBe(4);
  });

  it('flags direct TURNSTILE_SECRET usage', () => {
    const filePath = 'src/example/turnstileSecret.ts';
    const content = `
      const secret = process.env.TURNSTILE_SECRET;
      console.log(secret);
    `;

    const violations = scanTurnstileEnvUsage(filePath, content);
    expect(violations.length).toBe(1);
    expect(violations[0]?.rule.id).toBe('turnstile-secret-key');
  });

  it('flags common TURNSTILE_SECRET variants (optional chaining + bracket)', () => {
    const filePath = 'src/example/turnstileSecretVariants.ts';
    const content = `
      const a = process.env['TURNSTILE_SECRET'];
      const b = process?.env.TURNSTILE_SECRET;
      const c = process.env?.TURNSTILE_SECRET;
      const d = process?.env?.['TURNSTILE_SECRET'];
    `;

    const violations = scanTurnstileEnvUsage(filePath, content);
    const secretViolations = violations.filter(
      (violation) => violation.rule.id === 'turnstile-secret-key',
    );

    expect(secretViolations.length).toBe(4);
  });

  it('does not flag Turnstile env usage inside runtimeEnv helper itself', () => {
    const filePath = 'src/lib/runtimeEnv.ts';
    const content = readFileSync(
      path.resolve(__dirname, '../../src/lib/runtimeEnv.ts'),
      'utf-8',
    );

    const violations = scanTurnstileEnvUsage(filePath, content);
    expect(violations.length).toBe(0);
  });
});
