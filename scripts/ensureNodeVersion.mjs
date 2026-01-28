import fs from 'node:fs';
import path from 'node:path';

import { isRelease, isStaging } from '../envPrimitives.mjs';

const ROOT = process.cwd();
const NVMRC = path.join(ROOT, '.nvmrc');

const normalize = (value) => value.trim().replace(/^v/, '');

const major = (version) => normalize(version).split('.')[0] ?? '';

const expected = fs.existsSync(NVMRC)
  ? normalize(fs.readFileSync(NVMRC, 'utf8'))
  : null;
const actual = normalize(process.version);

if (!expected) {
  console.warn('Node version check skipped: .nvmrc not found.');
  process.exit(0);
}

if ((isRelease() || isStaging()) && major(actual) === major(expected)) {
  if (actual !== expected) {
    console.warn(
      `Hosted env detected: expected Node ${expected}, running ${actual}. ` +
        `Proceeding because major versions match (${major(expected)}).`,
    );
  }
  process.exit(0);
}

if (actual !== expected) {
  console.error(
    `Node ${expected} required, but ${actual} is running. ` +
      'Run `nvm use` (or your Node version manager) and retry.',
  );
  process.exit(1);
}
