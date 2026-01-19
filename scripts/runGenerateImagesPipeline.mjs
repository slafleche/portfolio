import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

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

const parseTargetFromArgs = (argv) => {
  const match = argv.find((arg) => arg.startsWith('--target='));
  if (!match) return null;
  const value = match.split('=')[1]?.trim();
  if (value === '_staging' || value === 'release' || value === 'both')
    return value;
  if (value === 's') return '_staging';
  if (value === 'r') return 'release';
  if (value === 'b') return 'both';
  return null;
};

const promptTarget = async () => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return 'both';
  console.log(
    'Select target for images: [_staging (s)/release (r)/both (b)] (default: both)',
  );
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('> ');
  await rl.close();
  const normalized = answer.trim().toLowerCase();
  if (normalized === '' || normalized === 'b' || normalized === 'both')
    return 'both';
  if (normalized === 's' || normalized === '_staging')
    return '_staging';
  if (normalized === 'r' || normalized === 'release') return 'release';
  return 'both';
};

const confirmSync = async () => {
  if (hasYesFlag) return true;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return true;
  console.log('Run cdn:sync --images now? [Y/n]:');
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('> ');
  await rl.close();
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
};

const confirmOverwrite = async () => {
  if (hasYesFlag) return true;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return true;
  console.log('Overwrite existing CDN objects? [Y/n]:');
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('> ');
  await rl.close();
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
};

const confirmOverwriteAll = async () => {
  if (hasYesFlag) return true;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return true;
  console.log('Overwrite all without per-file prompts? [Y/n]:');
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('> ');
  await rl.close();
  return answer.trim() === '' || /^y(es)?$/i.test(answer.trim());
};

if (args.includes('--help') || args.includes('-h')) {
  run('generate:img:files', ['--help']);
  process.exit(0);
}

const targetArg = parseTargetFromArgs(args) ?? (await promptTarget());
const targetArgs = args.some((arg) => arg.startsWith('--target='))
  ? args
  : [
      ...args,
      `--target=${targetArg}`,
    ];

run('generate:img:share-images', targetArgs);
run('generate:img:files', targetArgs);
const runSync = await confirmSync();
if (runSync) {
  const overwrite = await confirmOverwrite();
  const overwriteAll = overwrite ? await confirmOverwriteAll() : false;
  const syncArgs = overwriteAll
    ? [
        '--images',
        '--yes',
        ...targetArgs,
      ]
    : [
        '--images',
        ...targetArgs,
      ];
  run('cdn:sync', syncArgs);
  run('generate:img:artifacts', targetArgs);
}
