#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';

type FontConfigEntry = {
  type?: string;
};

type FontsConfig = Record<string, FontConfigEntry>;

const CONFIG_PATH = path.resolve('src', 'data', 'fonts.config.json');
const HASH_PATH = path.resolve(
  'src',
  'data',
  'generated',
  'selfHostedFonts.hash.json',
);
const OUT_ROOT = path.resolve('public', 'fonts', 'selfHosted');

const normalizeKey = (key: string) => key.replace(/\s+/g, '-');

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const writeHashCache = async (map: Record<string, string>) => {
  await ensureDir(path.dirname(HASH_PATH));
  await fs.writeFile(
    HASH_PATH,
    `${JSON.stringify(map, null, 2)}\n`,
    'utf8',
  );
};

const removeDir = async (dir: string) => {
  await fs
    .rm(dir, { recursive: true, force: true })
    .catch(() => undefined);
};

async function main() {
  const rawConfig = await fs.readFile(CONFIG_PATH, 'utf8');
  const config = JSON.parse(rawConfig) as FontsConfig;

  const hashCache: Record<string, string> = {};

  await ensureDir(OUT_ROOT);

  for (const [fontKey, entry] of Object.entries(config)) {
    if (entry?.type !== 'selfHosted') continue;
    const keySlug = normalizeKey(fontKey);
    const outDir = path.join(OUT_ROOT, `${keySlug}.gen`);

    await removeDir(outDir);
    await ensureDir(outDir);

    const placeholder = path.join(outDir, '.mock-placeholder');
    await fs.writeFile(
      placeholder,
      'mock self-hosted font placeholder\n',
      'utf8',
    );

    hashCache[fontKey] = 'mock';
    console.log(`✓ Mocked ${outDir}`);
  }

  await writeHashCache(hashCache);
  console.log(`✓ Wrote mock hash cache at ${HASH_PATH}`);
}

main().catch((error) => {
  console.error('✗ generateMockSelfHostedFonts failed');
  console.error(error);
  process.exit(1);
});
