import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

const resolvePaths = (target) => ({
  source: path.join(
    REPO_ROOT,
    'public',
    'cdn',
    'images',
    `manifest.${target}.json`,
  ),
  output: path.join(
    REPO_ROOT,
    'src',
    'data',
    'generated',
    `images.manifest.${target}.gen.json`,
  ),
});

async function fileExists(pathname) {
  try {
    await fs.access(pathname);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const opts = {
    help: argv.includes('--help') || argv.includes('-h'),
    target: '_staging',
  };
  for (const arg of argv) {
    if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'release') opts.target = t;
      else if (t === 's') opts.target = '_staging';
      else if (t === 'r') opts.target = 'release';
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      [
        'Usage: yarn generate:img:artifacts [--target=_staging|release]',
        '',
        'Copies the CDN-rewritten image manifest into src/data/generated so the app',
        'uses CDN URLs. Requires that cdn:sync --images has already run.',
        '',
        'Example:',
        '  yarn --cwd cdn cdn:sync --images --target=_staging',
        '  yarn --cwd cdn generate:img:artifacts --target=_staging',
      ].join('\n'),
    );
    return;
  }

  const { source: sourceManifest, output: outputManifest } = resolvePaths(
    opts.target,
  );

  if (!(await fileExists(sourceManifest))) {
    throw new Error(
      `Missing ${sourceManifest}. Run "yarn --cwd cdn cdn:sync --images --target=${opts.target}" first.`,
    );
  }

  const raw = await fs.readFile(sourceManifest, 'utf8');
  const parsed = JSON.parse(raw);
  await fs.mkdir(path.dirname(outputManifest), { recursive: true });
  await fs.writeFile(
    outputManifest,
    `${JSON.stringify(parsed, null, 2)}\n`,
    'utf8',
  );
  console.log(`✓ Wrote image manifest → ${outputManifest}`);
}

main().catch((error) => {
  console.error('❌ generateImageArtifacts failed');
  console.error(error);
  process.exit(1);
});
