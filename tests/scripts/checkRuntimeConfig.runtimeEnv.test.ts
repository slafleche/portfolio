import {
  describe,
  expect,
  it,
} from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { scanRuntimeEnvUsage } from '../../scripts/checkRuntimeConfig.mjs';
import {
  BRANCH_ENV_BARE_SNIPPET,
  BRANCH_ENV_DIRECT_SNIPPET,
  NODE_ENV_DIRECT_SNIPPET,
  NODE_ENV_VARIANTS_SNIPPET,
  PRIVATE_LAUNCH_ENV_SNIPPET,
  PRIVATE_LAUNCH_CONSOLE_LOG_SNIPPET,
  VERCEL_ENV_DIRECT_SNIPPET,
  VERCEL_ENV_VARIANTS_SNIPPET,
} from './runtimeEnvScannerFixtures';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('runtime env usage rules', () => {
  it('flags direct NODE_ENV usage', () => {
    const filePath = 'src/example/envNode.ts';
    const content = NODE_ENV_DIRECT_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    expect(
      violations.some(
        (violation) => violation.rule.id === 'runtime-node-env',
      ),
    ).toBe(true);
  });

  it('flags common NODE_ENV variants (optional chaining + bracket)', () => {
    const filePath = 'src/example/envNodeVariants.ts';
    const content = NODE_ENV_VARIANTS_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const nodeEnvViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-node-env',
    );

    expect(nodeEnvViolations.length).toBe(4);
  });

  it('flags direct VERCEL_ENV usage', () => {
    const filePath = 'src/example/envVercel.ts';
    const content = VERCEL_ENV_DIRECT_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    expect(
      violations.some(
        (violation) => violation.rule.id === 'runtime-vercel-env',
      ),
    ).toBe(true);
  });

  it('flags common VERCEL_ENV variants (optional chaining + bracket)', () => {
    const filePath = 'src/example/envVercelVariants.ts';
    const content = VERCEL_ENV_VARIANTS_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const vercelEnvViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-vercel-env',
    );

    expect(vercelEnvViolations.length).toBe(4);
  });

  it('flags direct branch env usage', () => {
    const filePath = 'src/example/envBranch.ts';
    const content = BRANCH_ENV_DIRECT_SNIPPET;

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
    const content = BRANCH_ENV_BARE_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const branchViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-vercel-branch',
    );

    expect(branchViolations.length).toBe(3);
  });

  it('flags private-launch env keys by name', () => {
    const filePath = 'src/example/envPrivateLaunch.ts';
    const content = PRIVATE_LAUNCH_ENV_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const privateLaunchViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-private-launch',
    );

    expect(privateLaunchViolations.length).toBe(5);
  });

  it('allows private-launch env keys inside console log strings', () => {
    const filePath = 'src/example/envPrivateLaunchConsoleLog.ts';
    const content = PRIVATE_LAUNCH_CONSOLE_LOG_SNIPPET;

    const violations = scanRuntimeEnvUsage(filePath, content);
    const privateLaunchViolations = violations.filter(
      (violation) => violation.rule.id === 'runtime-private-launch',
    );

    expect(privateLaunchViolations.length).toBe(0);
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
