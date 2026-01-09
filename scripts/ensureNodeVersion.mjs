import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NVMRC = path.join(ROOT, '.nvmrc');

const normalize = (value) => value.trim().replace(/^v/, '');

const expected = fs.existsSync(NVMRC)
  ? normalize(fs.readFileSync(NVMRC, 'utf8'))
  : null;
const actual = normalize(process.version);

if (!expected) {
  console.warn('Node version check skipped: .nvmrc not found.');
  process.exit(0);
}

if (actual !== expected) {
  console.error(
    `Node ${expected} required, but ${actual} is running. ` +
      'Run `nvm use` (or your Node version manager) and retry.',
  );
  process.exit(1);
}
