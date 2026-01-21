import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

const debugDir = path.join(repoRoot, 'app', '[LOCALE]', 'debug');

await rm(debugDir, { recursive: true, force: true });
console.log(
  `✓ Pruned debug routes for Vercel builds: ${path.relative(
    repoRoot,
    debugDir,
  )}`,
);
