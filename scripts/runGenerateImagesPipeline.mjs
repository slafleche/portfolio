import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const args = process.argv.slice(2);

const run = (script, extraArgs = []) => {
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

const hasYesFlag = args.includes('--yes') || args.includes('-y');

const confirmSync = async () => {
  if (hasYesFlag) return true;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return true;
  console.log('Run cdn:sync --images now? [Y/n]:');
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('> ');
  await rl.close();
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
};

if (args.includes('--help') || args.includes('-h')) {
  run('generate:img:files', ['--help']);
  process.exit(0);
}

run('generate:img:files', args);
const runSync = await confirmSync();
if (runSync) {
  run('cdn:sync', ['--images', ...args]);
  run('generate:img:artifacts', args);
}
