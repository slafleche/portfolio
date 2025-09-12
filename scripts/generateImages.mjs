#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'src/assets/images';
const OUT_ROOT = 'public/images'; // cleaned each run
const MANIFEST_PATH = 'src/data/images.manifest.json';

const WIDTHS = [320,
480,
640,
750,
828,
1080,
1200,
1920];
const FORMATS = [
  { ext: 'avif', to: (img) => img.avif({ quality: 50 }) },
  { ext: 'webp', to: (img) => img.webp({ quality: 70 }) },
  { ext: 'jpg', to: (img) => img.jpeg({ quality: 82, progressive: true }) },
];
const VALID_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.tif',
  '.tiff',
  '.avif',
]);

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function toName(filePath) {
  // "hero/banner big.JPG" -> "hero-banner-big"
  return path
    .relative(SRC_DIR, filePath)
    .replace(path.extname(filePath), '')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function cleanOutRoot() {
  try {
    await fs.rm(OUT_ROOT, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(OUT_ROOT, { recursive: true });
}

await cleanOutRoot();
await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });

const manifest = {}; // { [name]: {...} }

for await (const file of walk(SRC_DIR)) {
  const ext = path.extname(file).toLowerCase();
  if (!VALID_EXT.has(ext)) continue;

  const name = toName(file);
  const outDir = path.join(OUT_ROOT, name);
  await fs.mkdir(outDir, { recursive: true });

  const img = sharp(file).rotate(); // auto-orient EXIF
  const meta = await img.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) continue;

  // LQIP
  const lqipW = Math.min(24, srcW);
  const lqip = await img
    .clone()
    .resize({ width: lqipW })
    .blur()
    .jpeg({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/jpeg;base64,${lqip.toString('base64')}`;

  const item = {
    name,
    width: srcW,
    height: srcH,
    aspect: srcW / srcH,
    blurDataURL,
    variants: {}, // { avif:[{w,url}], webp:[...], jpg:[...] }
  };

  // NO UPSCALING
  const targetWidths = WIDTHS.filter((w) => w <= srcW);

  for (const { ext: outExt, to } of FORMATS) {
    const list = [];
    for (const w of targetWidths) {
      const fileName = `${w}.${outExt}`;
      const outPath = path.join(outDir, fileName);
      await to(img.clone().resize({ width: w })).toFile(outPath);
      list.push({ w, url: `/images/${name}/${fileName}` });
    }
    item.variants[outExt] = list;
  }

  // Original copy as fallback/LCP
  const origFile = `orig${ext || '.jpg'}`;
  await img.toFile(path.join(outDir, origFile));
  item.original = {
    url: `/images/${name}/${origFile}`,
    width: srcW,
    height: srcH,
  };

  manifest[name] = item;
}

await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`✓ Wrote manifest: ${MANIFEST_PATH}`);
console.log(`✓ Images in: ${OUT_ROOT} (clean build)`);
