import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const args = process.argv.slice(2);

type Target = '_staging' | 'release' | 'both';

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

const runRoot = (script: string, extraArgs: string[] = []) => {
  const commandArgs =
    extraArgs.length > 0 ? [script, '--', ...extraArgs] : [script];
  const result = spawnSync('yarn', commandArgs, {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const runCdnPipeline = (
  targetName: Exclude<Target, 'both'>,
  extraArgs: string[] = [],
) => {
  const targetArg = `--target=${targetName}`;
  const combinedArgs = [targetArg, ...extraArgs];
  run('generate:fonts', combinedArgs);
  run('generate:img', combinedArgs);
  run('generate:videos', combinedArgs);
};

const parseTarget = (argv: string[]): Target => {
  for (const arg of argv) {
    if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'staging' || t === 's') return '_staging';
      if (t === 'release' || t === 'r') return 'release';
      if (t === 'both') return 'both';
    }
  }
  return 'both';
};

const wantsHelp = args.includes('--help') || args.includes('-h');
const target = parseTarget(args);
const cdnArgs = args.filter((arg) => !arg.startsWith('--target='));

if (wantsHelp) {
  console.log(
    [
      'Usage: yarn generate [--target=_staging|release|both] [--yes]',
      '',
      'Runs:',
      '  yarn locales',
      '  yarn generate:favicons',
      '  yarn --cwd cdn generate:fonts',
      '  yarn --cwd cdn generate:img',
      '  yarn --cwd cdn generate:videos',
      '',
      'Examples:',
      '  yarn generate',
      '  yarn generate --target=_staging',
      '  yarn generate --target=release --yes',
    ].join('\n'),
  );
  run('generate:fonts', ['--help']);
  run('generate:img', ['--help']);
  run('generate:videos', ['--help']);
  process.exit(0);
}

runRoot('locales');
runRoot('generate:favicons');

if (target === 'both') {
  runCdnPipeline('_staging', cdnArgs);
  runCdnPipeline('release', cdnArgs);
} else if (target === '_staging') {
  runCdnPipeline('_staging', cdnArgs);
} else {
  runCdnPipeline('release', cdnArgs);
}
