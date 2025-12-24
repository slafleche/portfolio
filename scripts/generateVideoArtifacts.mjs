import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

const SOURCE_MANIFEST = path.join(
  REPO_ROOT,
  'public',
  'cdn',
  'video',
  'manifest.json',
);
const OUTPUT_MANIFEST = path.join(
  REPO_ROOT,
  'src',
  'data',
  'generated',
  'videos.manifest.gen.json',
);

async function fileExists(pathname) {
  try {
    await fs.access(pathname);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  return {
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      [
        'Usage: yarn generate:video:artifacts',
        '',
        'Copies the CDN-rewritten video manifest into src/data/generated so the app',
        'uses CDN URLs. Requires that cdn:sync --video has already run.',
        '',
        'Example:',
        '  yarn --cwd cdn cdn:sync --video --target=_staging',
        '  yarn --cwd cdn generate:video:artifacts',
      ].join('\n'),
    );
    return;
  }

  if (!(await fileExists(SOURCE_MANIFEST))) {
    throw new Error(
      `Missing ${SOURCE_MANIFEST}. Run "yarn --cwd cdn cdn:sync --video --target=_staging" first.`,
    );
  }

  const raw = await fs.readFile(SOURCE_MANIFEST, 'utf8');
  const parsed = JSON.parse(raw);
  await fs.mkdir(path.dirname(OUTPUT_MANIFEST), { recursive: true });
  await fs.writeFile(
    OUTPUT_MANIFEST,
    `${JSON.stringify(parsed, null, 2)}\n`,
    'utf8',
  );
  console.log(`✓ Wrote video manifest → ${OUTPUT_MANIFEST}`);
}

main().catch((error) => {
  console.error('❌ generateVideoArtifacts failed');
  console.error(error);
  process.exit(1);
});
