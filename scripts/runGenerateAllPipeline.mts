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
    [
      '--cwd',
      path.join(REPO_ROOT, 'cdn'),
      script,
      ...extraArgs,
    ],
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
    extraArgs.length > 0
      ? [
          script,
          '--',
          ...extraArgs,
        ]
      : [
          script,
        ];
  const result = spawnSync('yarn', commandArgs, {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const runCdnPipeline = (
  targetName: Exclude<Target, 'both'>,
  kinds: { fonts: boolean; images: boolean; videos: boolean },
  extraArgs: string[] = [],
) => {
  const targetArg = `--target=${targetName}`;
  const combinedArgs = [
    targetArg,
    ...extraArgs,
  ];
  if (kinds.fonts) run('generate:fonts', combinedArgs);
  if (kinds.images) run('generate:img', combinedArgs);
  if (kinds.videos) run('generate:videos', combinedArgs);
};

const parseTarget = (argv: string[]): Target => {
  for (const arg of argv) {
    if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'staging' || t === 's')
        return '_staging';
      if (t === 'release' || t === 'r') return 'release';
      if (t === 'both') return 'both';
    }
  }
  return 'both';
};

const parseKinds = (argv: string[]) => {
  let fonts = false;
  let images = false;
  let videos = false;
  for (const arg of argv) {
    if (arg === '--fonts') fonts = true;
    if (arg === '--images') images = true;
    if (arg === '--videos') videos = true;
  }

  if (!fonts && !images && !videos) {
    return { fonts: true, images: true, videos: true };
  }

  return { fonts, images, videos };
};

const parseSkipCdn = (argv: string[]) =>
  argv.includes('--skip-cdn') || argv.includes('--no-cdn');

const wantsHelp = args.includes('--help') || args.includes('-h');
const target = parseTarget(args);
const kinds = parseKinds(args);
const skipCdn = parseSkipCdn(args);
const cdnArgs = args.filter(
  (arg) =>
    !arg.startsWith('--target=') &&
    arg !== '--skip-cdn' &&
    arg !== '--no-cdn' &&
    arg !== '--fonts' &&
    arg !== '--images' &&
    arg !== '--videos',
);

if (wantsHelp) {
  console.log(
    [
      'Usage: yarn generate [--target=_staging|release|both] [--fonts] [--images] [--videos] [--yes]',
      '       yarn generate --skip-cdn',
      '',
      'Runs:',
      '  yarn locales',
      '  yarn generate:favicons',
      '  yarn build:hero-svg',
      '  yarn build:share-images',
      '  yarn generate:sitemap',
      '  yarn --cwd cdn generate:fonts (when --fonts or no media flags)',
      '  yarn --cwd cdn generate:img (when --images or no media flags)',
      '  yarn --cwd cdn generate:videos (when --videos or no media flags)',
      '',
      'Examples:',
      '  yarn generate',
      '  yarn generate --fonts --yes',
      '  yarn generate --target=_staging',
      '  yarn generate --target=release --yes',
    ].join('\n'),
  );
  run('generate:fonts', [
    '--help',
  ]);
  run('generate:img', [
    '--help',
  ]);
  run('generate:videos', [
    '--help',
  ]);
  process.exit(0);
}

runRoot('locales');
runRoot('generate:favicons');
runRoot('build:hero-svg');
runRoot('build:share-images');
runRoot('generate:sitemap');

if (!skipCdn) {
  if (target === 'both') {
    runCdnPipeline('_staging', kinds, cdnArgs);
    runCdnPipeline('release', kinds, cdnArgs);
  } else if (target === '_staging') {
    runCdnPipeline('_staging', kinds, cdnArgs);
  } else {
    runCdnPipeline('release', kinds, cdnArgs);
  }
}
