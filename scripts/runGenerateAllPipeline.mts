import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const args = process.argv.slice(2);

const run = (script: string, extraArgs: string[] = []) => {
  const result = spawnSync(
    'yarn',
    ['--cwd', path.join(REPO_ROOT, 'cdn'), script, ...extraArgs],
    {
      stdio: 'inherit',
    },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (args.includes('--help') || args.includes('-h')) {
  run('generate:fonts', ['--help']);
  run('generate:img', ['--help']);
  run('generate:videos', ['--help']);
  process.exit(0);
}

run('generate:fonts', args);
run('generate:img', args);
run('generate:videos', args);
