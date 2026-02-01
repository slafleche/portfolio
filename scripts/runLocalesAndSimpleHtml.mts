import { spawnSync } from 'node:child_process';

const run = (args: string[]) => {
  const result = spawnSync('yarn', args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const isCiLike =
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.VERCEL === '1' ||
  Boolean(process.env.VERCEL_ENV);

run(['locales']);

if (isCiLike) {
  console.info(
    '[simpleHtml] Skipping HTML snapshot generation in CI/Vercel.',
  );
  process.exit(0);
}

const args = process.argv.slice(2);
run(
  args.length > 0
    ? [
        'simpleHtml',
        '--',
        ...args,
      ]
    : [
        'simpleHtml',
      ],
);

