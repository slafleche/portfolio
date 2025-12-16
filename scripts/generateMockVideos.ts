import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC_MAP_PATH = path.resolve(
  __dirname,
  '../src/assets/videos/videoSources.json',
);
const MANIFEST_PATH = path.resolve(
  __dirname,
  '../src/data/generated/videos.manifest.gen.json',
);

const toName = (value: string): string =>
  value
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();

async function main() {
  const raw = await fs.readFile(SRC_MAP_PATH, 'utf8');
  const sources = JSON.parse(raw) as Record<string, unknown>;

  const manifest: Record<string, unknown> = {};

  for (const rawName of Object.keys(sources)) {
    const name = toName(rawName);

    manifest[name] = {
      name,
      width: 1920,
      height: 1080,
      aspect: 16 / 9,
      duration: 0,
      hasAudio: false,
      masterUrl: '',
      posterUrl: '',
      variants: [],
    };
  }

  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`✅ Wrote mock video manifest → ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
