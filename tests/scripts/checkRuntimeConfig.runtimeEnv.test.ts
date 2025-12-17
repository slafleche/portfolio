import {
  describe,
  expect,
  it,
} from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { scanRuntimeEnvUsage } from '../../scripts/checkRuntimeConfig.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('runtime env usage rules', () => {
  it('flags direct NODE_ENV usage', () => {
    const filePath = 'src/example/envNode.ts';
    const content = `
      if (process.env.NODE_ENV === 'production') {
        console.log('prod');
      }
    `;

    const violations = scanRuntimeEnvUsage(filePath, content);
    expect(
      violations.some(
        (violation) => violation.rule.id === 'runtime-node-env',
      ),
    ).toBe(true);
  });

  it('flags common NODE_ENV variants (optional chaining + bracket)', () => {
    const filePath = 'src/example/envNodeVariants.ts';
    const content = `
      const a = process.env['NODE_ENV'];
      const b = process?.env.NODE_ENV;
      const c = process.env?.NODE_ENV;
      const d = process?.env?.['NODE_ENV'];
    `;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const nodeEnvViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-node-env',
    );

    expect(nodeEnvViolations.length).toBe(4);
  });

  it('flags direct VERCEL_ENV usage', () => {
    const filePath = 'src/example/envVercel.ts';
    const content = `
      const env = process.env.VERCEL_ENV;
      if (env === 'production') {
        console.log('release');
      }
    `;

    const violations = scanRuntimeEnvUsage(filePath, content);
    expect(
      violations.some(
        (violation) => violation.rule.id === 'runtime-vercel-env',
      ),
    ).toBe(true);
  });

  it('flags common VERCEL_ENV variants (optional chaining + bracket)', () => {
    const filePath = 'src/example/envVercelVariants.ts';
    const content = `
      const a = process.env['VERCEL_ENV'];
      const b = process?.env.VERCEL_ENV;
      const c = process.env?.VERCEL_ENV;
      const d = process?.env?.['VERCEL_ENV'];
    `;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const vercelEnvViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-vercel-env',
    );

    expect(vercelEnvViolations.length).toBe(4);
  });

  it('flags direct branch env usage', () => {
    const filePath = 'src/example/envBranch.ts';
    const content = `
      const branch =
        process.env.VERCEL_GIT_COMMIT_REF ||
        process.env.VERCEL_GIT_BRANCH ||
        process.env.BRANCH;
      console.log(branch);
    `;

    const violations = scanRuntimeEnvUsage(filePath, content);
    expect(
      violations.some(
        (violation) =>
          violation.rule.id === 'runtime-vercel-branch',
      ),
    ).toBe(true);
  });

  it('flags bare branch env names, not just process.env usage', () => {
    const filePath = 'src/example/envBranchBare.ts';
    const content = `
      const a = VERCEL_GIT_COMMIT_REF;
      const b = VERCEL_GIT_BRANCH;
      const c = BRANCH;
    `;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const branchViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-vercel-branch',
    );

    expect(branchViolations.length).toBe(3);
  });

  it('does not flag env usage inside runtimeEnv helper itself', () => {
    const filePath = 'src/lib/runtimeEnv.ts';
    const content = readFileSync(
      path.resolve(__dirname, '../../src/lib/runtimeEnv.ts'),
      'utf-8',
    );

    const violations = scanRuntimeEnvUsage(filePath, content);
    expect(violations.length).toBe(0);
  });
});
