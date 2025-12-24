#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

const IMAGE_SOURCES_DIR = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'images',
  'localImageSrc',
);
const IMAGE_SOURCES_CONFIG = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'images',
  'imageSources.json',
);
const VIDEO_MANIFEST_PATH = path.join(
  REPO_ROOT,
  'src/data/generated/videos.manifest.gen.json',
);
const IGNORE_DIRS = new Set([]);

const IMAGE_CACHE_PREFIX = 'img';
const IMAGE_CACHE_HASH_LENGTH = 8;
const OUT_ROOT_BASE = path.resolve(REPO_ROOT, 'tmp', 'cdn');
const VERSIONS_PATH = path.resolve(
  REPO_ROOT,
  'cdn',
  'assetGroupVersions.json',
);
const CATEGORY = 'images';

const MIME_EXTENSIONS = new Map([
  [
    'image/jpeg',
    '.jpg',
  ],
  [
    'image/png',
    '.png',
  ],
  [
    'image/webp',
    '.webp',
  ],
  [
    'image/avif',
    '.avif',
  ],
  [
    'image/tiff',
    '.tif',
  ],
  [
    'image/x-tiff',
    '.tif',
  ],
]);

const WIDTHS = [
  320,
  480,
  640,
  750,
  828,
  1080,
  1200,
  1920,
];
const FORMATS = [
  { ext: 'avif', to: (img) => img.avif({ quality: 50 }) },
  { ext: 'webp', to: (img) => img.webp({ quality: 70 }) },
  {
    ext: 'jpg',
    to: (img) => img.jpeg({ quality: 82, progressive: true }),
  },
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

const sharpFormatForExt = (ext) => {
  switch (ext) {
    case '.jpeg':
    case '.jpg':
      return 'jpeg';
    case '.png':
      return 'png';
    case '.webp':
      return 'webp';
    case '.avif':
      return 'avif';
    case '.tif':
    case '.tiff':
      return 'tiff';
    default:
      return 'jpeg';
  }
};

const hashBuffer = (buffer, length) => {
  const rawHash = crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
  return rawHash.slice(0, Math.max(1, length));
};

async function loadJson(pathname) {
  try {
    const raw = await fs.readFile(pathname, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJsonAtomic(pathname, data) {
  const dir = path.dirname(pathname);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${pathname}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmpPath, pathname);
}

async function removeHashedImageDirs(name, outRoot) {
  const prefix = `${IMAGE_CACHE_PREFIX}-${name}-`;
  let entries = [];
  try {
    entries = await fs.readdir(outRoot);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith(prefix))
      .map((entry) =>
        fs.rm(path.join(outRoot, entry), {
          recursive: true,
          force: true,
        }),
      ),
  );
}

// --- Duplicate-name handling ---
class DuplicateNameError extends Error {
  constructor(name, prev, next) {
    const label = (s) =>
      s === 'local'
        ? 'src/assets/images'
        : s === 'remote'
          ? 'imageSources.json'
          : 'videos.manifest.gen.json';

    const message = [
      '\n',
      '🚫  DUPLICATE IMAGE NAME DETECTED',
      '───────────────────────────────────────────────',
      `❌  Name: ${name}`,
      '',
      `🟣 First seen in:  ${label(prev.source)}`,
      `    ↳ ${prev.origin}`,
      '',
      `🔴 Conflicts with: ${label(next.source)}`,
      `    ↳ ${next.origin}`,
      '',
      '💡 Rename one of them so every image name is unique.',
      '───────────────────────────────────────────────',
    ].join('\n');
    super(message);
    this.name = 'DuplicateNameError';
    this.code = 'DUPLICATE_IMAGE_NAME';
  }
}

const seenNames = new Map();

function ensureUniqueName(name, source, origin) {
  if (!name)
    throw new Error(
      `Internal error: empty image name from ${source} (${origin}).`,
    );
  if (seenNames.has(name)) {
    const prev = seenNames.get(name);
    throw new DuplicateNameError(name, prev, { source, origin });
  }
  seenNames.set(name, { source, origin });
}
// --- end duplicate-name handling ---

function ensureDirectDropboxUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (
      url.hostname === 'www.dropbox.com' ||
      url.hostname === 'dropbox.com'
    ) {
      url.hostname = 'dl.dropboxusercontent.com';
      if (url.searchParams.get('dl') === '0')
        url.searchParams.set('dl', '1');
      return url.toString();
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function normalizeRemoteImageUrl(rawUrl) {
  try {
    const dropboxNormalized = ensureDirectDropboxUrl(rawUrl);
    const url = new URL(dropboxNormalized);
    if (url.hostname === 'drive.google.com') {
      const match = url.pathname.match(/\/file\/d\/([^/]+)/);
      if (match)
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function extensionFromMime(mime) {
  if (!mime) return '';
  const clean = mime.split(';', 1)[0].trim().toLowerCase();
  return MIME_EXTENSIONS.get(clean) ?? '';
}

function extensionFromUrl(rawUrl) {
  try {
    const { pathname } = new URL(rawUrl);
    return path.extname(pathname).toLowerCase();
  } catch {
    return path.extname(rawUrl).toLowerCase();
  }
}

async function loadImageSourcesConfig() {
  try {
    const raw = await fs.readFile(IMAGE_SOURCES_CONFIG, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function loadVideoManifest() {
  try {
    const raw = await fs.readFile(VIDEO_MANIFEST_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(
        `ℹ️  Video manifest not found at "${VIDEO_MANIFEST_PATH}". Run the video pipeline first to enable video previews.`,
      );
      return null;
    }
    throw error;
  }
}

function toPublicPathFromUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed, 'http://localhost');
    const pathname = url.pathname.replace(/^\/+/, '');
    return pathname ? path.resolve(REPO_ROOT, pathname) : '';
  } catch {
    const withoutQuery = trimmed.split('?')[0] ?? '';
    const pathname = withoutQuery.replace(/^\/+/, '');
    return pathname ? path.resolve(REPO_ROOT, pathname) : '';
  }
}

async function downloadRemoteImage(name, rawUrl, tempDir) {
  if (typeof fetch !== 'function')
    throw new Error(
      'fetch is not available in this Node.js runtime.',
    );
  const normalizedUrl = normalizeRemoteImageUrl(rawUrl);
  const response = await fetch(normalizedUrl);
  if (!response.ok)
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  let ext =
    extensionFromUrl(normalizedUrl) || extensionFromUrl(rawUrl);
  if (!VALID_EXT.has(ext))
    ext =
      extensionFromMime(response.headers.get('content-type')) ||
      '.jpg';
  if (!VALID_EXT.has(ext)) ext = '.jpg';
  const filePath = path.join(tempDir, `${name}${ext}`);
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  return filePath;
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, {
    withFileTypes: true,
  })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(p)) continue;
      yield* walk(p);
    } else {
      yield p;
    }
  }
}

function toName(filePath) {
  return path
    .relative(IMAGE_SOURCES_DIR, filePath)
    .replace(path.extname(filePath), '')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function processImage(
  filePath,
  nameOverride,
  manifest,
  provenance,
  outRoot,
  hashes,
  existingManifest,
) {
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_EXT.has(ext)) return;

  const name = nameOverride ?? toName(filePath);
  ensureUniqueName(
    name,
    provenance?.source ?? 'local',
    provenance?.origin ?? filePath,
  );

  const img = sharp(filePath).rotate();
  const meta = await img.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) return;

  const format = sharpFormatForExt(ext);
  const { data: originalBuffer } = await img
    .clone()
    .toFormat(format)
    .toBuffer({ resolveWithObject: true });
  const hash = hashBuffer(originalBuffer, IMAGE_CACHE_HASH_LENGTH);
  const dirSlug = `${IMAGE_CACHE_PREFIX}-${name}-${hash}`;
  const outDir = path.join(outRoot, dirSlug);

  const existingHash = hashes[name];
  if (existingHash && existingHash === hash && existingManifest[name]) {
    manifest[name] = existingManifest[name];
    console.log(
      `   • Skipping "${name}" — hash unchanged (${hash}).`,
    );
    return;
  }

  await removeHashedImageDirs(name, outRoot);
  await fs.mkdir(outDir, { recursive: true });

  console.log(
    `   • Generating variants for "${name}" (${srcW}x${srcH}) → ${dirSlug}`,
  );

  const lqipW = Math.min(24, srcW);
  const lqip = await img
    .clone()
    .resize({ width: lqipW })
    .blur()
    .jpeg({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/jpeg;base64,${lqip.toString('base64')}`;

  const baseUrl = `${dirSlug}`;

  const item = {
    name,
    hash,
    basePath: baseUrl,
    dirName: dirSlug,
    width: srcW,
    height: srcH,
    aspect: srcW / srcH,
    blurDataURL,
    variants: {},
  };
  const targetWidths = WIDTHS.filter((w) => w <= srcW);

  for (const { ext: outExt, to } of FORMATS) {
    const list = [];
    for (const w of targetWidths) {
      const fileName = `${w}.${outExt}`;
      const outPath = path.join(outDir, fileName);
      await to(img.clone().resize({ width: w })).toFile(outPath);
      list.push({ w, url: `${baseUrl}/${fileName}` });
    }
    item.variants[outExt] = list;
  }

  const origFile = `orig${ext || '.jpg'}`;
  await fs.writeFile(path.join(outDir, origFile), originalBuffer);
  item.original = {
    url: `${baseUrl}/${origFile}`,
    width: srcW,
    height: srcH,
  };

  manifest[name] = item;
  hashes[name] = hash;
  console.log(
    `   • Completed "${name}" (${targetWidths.length} responsive widths, plus original).`,
  );
}

async function prepareOutRoot(target, version) {
  const outRoot = path.join(OUT_ROOT_BASE, target, 'images', version);
  await fs.mkdir(outRoot, { recursive: true });
  return outRoot;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    target: '_staging',
    versionOverride: null,
    bump: false,
    help: false,
  };
  for (const arg of args) {
    if (arg === '--bump') {
      opts.bump = true;
    } else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === 'both') opts.target = 'both';
      else if (t === '_staging' || t === 'release') opts.target = t;
    } else if (arg.startsWith('--version=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) opts.versionOverride = v;
    }
  }
  return opts;
}

async function loadVersions() {
  const raw = await fs.readFile(VERSIONS_PATH, 'utf8');
  return JSON.parse(raw);
}

async function saveVersions(map) {
  await writeJsonAtomic(VERSIONS_PATH, map);
}

function bumpVersion(v) {
  const match = String(v ?? '').match(/^v(\d+)$/i);
  if (!match) return 'v1';
  const next = Number(match[1]) + 1;
  return `v${next}`;
}

async function processTargets(targets, versionOverride, bumpFlag) {
  const versions = await loadVersions();
  let versionsChanged = false;

  for (const target of targets) {
    seenNames.clear();
    const localOrigins = new Map();
    // Paths
    const targetImagesRoot = path.join(OUT_ROOT_BASE, target, 'images');
    await fs.mkdir(targetImagesRoot, { recursive: true });
    const current = versions[target]?.[CATEGORY];
    const chosen = versionOverride
      ? versionOverride
      : bumpFlag
        ? bumpVersion(current)
        : current;
    if (!chosen) {
      throw new Error(
        `Missing version for ${target}/${CATEGORY} in ${VERSIONS_PATH}`,
      );
    }
    if (!versions[target]) versions[target] = {};
    if (bumpFlag && chosen !== current) {
      versions[target][CATEGORY] = chosen;
      versionsChanged = true;
    }
    const existingManifestPath = path.join(
      targetImagesRoot,
      chosen,
      'manifest.json',
    );
    const existingManifest =
      (await loadJson(existingManifestPath)) ?? {};

    const outRoot = await prepareOutRoot(target, chosen);
    console.log(
      `→ Target "${target}" @ version "${chosen}" → ${outRoot}`,
    );

    const tempDir = path.join(
      OUT_ROOT_BASE,
      'downloads',
      target,
      chosen,
      Math.random().toString(16).slice(2),
    );
    console.log(`→ Ensuring temporary download directory "${tempDir}"`);
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(tempDir, { recursive: true });

    const hashesPath = path.join(
      OUT_ROOT_BASE,
      'downloads',
      target,
      chosen,
      'hashes.json',
    );
    const hashesDir = path.dirname(hashesPath);
    await fs.mkdir(hashesDir, { recursive: true });
    const hashes = (await loadJson(hashesPath)) ?? {};

    const manifest = {};

    console.log(`→ Walking source images in "${IMAGE_SOURCES_DIR}"`);
    let localCount = 0;
    try {
      await fs.access(IMAGE_SOURCES_DIR);
      for await (const file of walk(IMAGE_SOURCES_DIR)) {
        const candidateName = toName(file);
        await processImage(
          file,
          undefined,
          manifest,
          {
            source: 'local',
            origin: file,
          },
          outRoot,
          hashes,
          existingManifest,
        );
        localCount += 1;
        if (manifest[candidateName]) {
          localOrigins.set(candidateName, file);
        }
      }
      console.log(
        `   ✓ Processed ${localCount} local image${localCount === 1 ? '' : 's'}.`,
      );
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(
          `   • No local image directory at "${IMAGE_SOURCES_DIR}", skipping.`,
        );
      } else {
        throw error;
      }
    }

    console.log(
      `→ Loading remote image source manifest "${IMAGE_SOURCES_CONFIG}"`,
    );
    let imageSourcesMap = await loadImageSourcesConfig();
    // Preflight validation: empty URLs and duplicate names.
    const remoteNames = new Set();
    const dropboxUpdates = [];
    let manifestChanged = false;
    for (const [
      name,
      rawUrl,
    ] of Object.entries(imageSourcesMap)) {
      if (typeof rawUrl !== 'string') continue;
      if (remoteNames.has(name)) {
        throw new Error(
          `Duplicate key "${name}" detected in ${IMAGE_SOURCES_CONFIG}.`,
        );
      }
      remoteNames.add(name);
      const trimmed = rawUrl.trim();
      if (!trimmed) {
        throw new Error(
          `Remote image "${name}" has an empty URL. Fix ${IMAGE_SOURCES_CONFIG}.`,
        );
      }
      const normalized = ensureDirectDropboxUrl(trimmed);
      if (normalized !== trimmed) {
        dropboxUpdates.push(name);
        imageSourcesMap[name] = normalized;
        manifestChanged = true;
      } else if (trimmed !== rawUrl) {
        imageSourcesMap[name] = trimmed;
        manifestChanged = true;
      }
      if (localOrigins.has(name)) {
        throw new DuplicateNameError(
          name,
          {
            source: 'local',
            origin: localOrigins.get(name),
          },
          {
            source: 'remote',
            origin: IMAGE_SOURCES_CONFIG,
          },
        );
      }
    }
    if (manifestChanged) {
      await writeJsonAtomic(IMAGE_SOURCES_CONFIG, imageSourcesMap);
      console.log('   ✓ Wrote normalized remote image source manifest.');
      if (dropboxUpdates.length)
        console.log(
          `     - Applied direct Dropbox links for: ${dropboxUpdates.join(', ')}`,
        );
    } else {
      console.log('   • No Dropbox URL updates needed.');
    }

    const remoteImageEntries = Object.entries(imageSourcesMap);

    if (remoteImageEntries.length) {
      console.log(
        `→ Downloading and processing ${remoteImageEntries.length} remote image${remoteImageEntries.length === 1 ? '' : 's'}`,
      );
      let remoteCount = 0;
      for (const [
        name,
        rawUrl,
      ] of remoteImageEntries) {
        const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
        try {
          console.log(`   • Downloading "${name}" from ${url}`);
          const filePath = await downloadRemoteImage(
            name,
            url,
            tempDir,
          );
          console.log(`     - Saved to ${filePath}`);
          await processImage(filePath, name, manifest, {
            source: 'remote',
            origin: url,
          }, outRoot, hashes, existingManifest);
          remoteCount += 1;
        } catch (error) {
          if (error && error.code === 'DUPLICATE_IMAGE_NAME') throw error;
          console.error(
            `✗ Failed to process remote image "${name}": ${error.message}`,
          );
        }
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(
        () => {},
      );
      console.log(
        `   ✓ Processed ${remoteCount} remote image${remoteCount === 1 ? '' : 's'}.`,
      );
    } else {
      console.log('→ No remote image sources configured.');
    }

    const manifestNames = new Set(Object.keys(manifest));
    const staleNames = new Set([
      ...Object.keys(existingManifest ?? {}),
      ...Object.keys(hashes ?? {}),
    ]);
    for (const name of manifestNames) staleNames.delete(name);
    if (staleNames.size > 0) {
      console.log(
        `→ Removing ${staleNames.size} stale image${
          staleNames.size === 1 ? '' : 's'
        } from ${outRoot}`,
      );
      for (const name of staleNames) {
        await removeHashedImageDirs(name, outRoot);
        delete hashes[name];
      }
    }

    // Legacy video poster handling (moved to video pipeline; kept for reference):
    // console.log(
    //   `→ Checking for video posters via "${VIDEO_MANIFEST_PATH}"`,
    // );
    // const videoManifest = await loadVideoManifest();
    // if (videoManifest) {
    //   const entries = Object.entries(videoManifest);
    //   if (entries.length === 0) {
    //     console.log(
    //       'ℹ️ Video manifest is empty. No video previews will be generated.',
    //     );
    //   } else {
    //     let processed = 0;
    //     const manifestMissingPosterUrl = [];
    //     const unresolvedPosterPaths = [];
    //     const missingPosterFiles = [];
    //     for (const [name, data] of entries) {
    //       const posterUrl =
    //         typeof data === 'object' && data !== null
    //           ? data.posterUrl
    //           : '';
    //       if (typeof posterUrl !== 'string' || !posterUrl.trim()) {
    //         manifestMissingPosterUrl.push(name);
    //         continue;
    //       }
    //       const posterPath = toPublicPathFromUrl(posterUrl);
    //       if (!posterPath) {
    //         unresolvedPosterPaths.push([name, posterUrl]);
    //         continue;
    //       }
    //       try {
    //         await fs.access(posterPath);
    //       } catch {
    //         missingPosterFiles.push([name, posterPath]);
    //         continue;
    //       }
    //       const baseName =
    //         typeof data === 'object' &&
    //         data !== null &&
    //         typeof data.name === 'string' &&
    //         data.name.trim()
    //           ? data.name.trim().toLowerCase()
    //           : `${name}`.trim().toLowerCase();
    //       const videoImageName = `video-${baseName.replace(/[^\dA-Za-z_-]/g, '-')}`;
    //       try {
    //         await processImage(
    //           posterPath,
    //           videoImageName,
    //           manifest,
    //           {
    //             source: 'video',
    //             origin: `${VIDEO_MANIFEST_PATH} → ${name}`,
    //           },
    //           outRoot,
    //           hashes,
    //           existingManifest,
    //         );
    //         processed += 1;
    //       } catch (error) {
    //         if (error && error.code === 'DUPLICATE_IMAGE_NAME') throw error;
    //         console.error(
    //           `✗ Failed to process video poster "${name}": ${error.message}`,
    //         );
    //       }
    //     }
    //     if (manifestMissingPosterUrl.length) {
    //       console.log(
    //         `ℹ️ Video manifest entries missing posterUrl: ${manifestMissingPosterUrl.join(', ')}.`,
    //       );
    //     }
    //     if (unresolvedPosterPaths.length) {
    //       console.log(
    //         'ℹ️ Could not resolve local poster path for videos:\n' +
    //           unresolvedPosterPaths
    //             .map(([n, url]) => `   • ${n} → ${url}`)
    //             .join('\n'),
    //       );
    //     }
    //     if (missingPosterFiles.length) {
    //       console.log(
    //         'ℹ️ Poster image missing for videos:\n' +
    //           missingPosterFiles
    //             .map(([n, p]) => `   • ${n} → ${p}`)
    //             .join('\n') +
    //           '\n   Did you run "generateVideos" first?',
    //       );
    //     }
    //     if (processed > 0) {
    //       console.log(
    //         `   ✓ Processed ${processed} video poster image${processed === 1 ? '' : 's'}.`,
    //       );
    //     } else {
    //       console.log(
    //         'ℹ️ No video poster images were processed. Check notes above.',
    //       );
    //     }
    //   }
    // }

    const manifestPath = path.join(outRoot, 'manifest.json');
    await writeJsonAtomic(manifestPath, manifest);
    console.log(`✓ Wrote manifest: ${manifestPath}`);
    await writeJsonAtomic(hashesPath, hashes);
    console.log(`✓ Wrote hashes: ${hashesPath}`);
    console.log(`✓ Images in: ${outRoot} (clean build)`);
  }

  if (versionsChanged) {
    await saveVersions(versions);
    console.log(`✓ Updated versions file at ${VERSIONS_PATH}`);
  }
}

async function main() {
  const opts = parseArgs();
  if (opts.help) {
    console.log(
      [
        'Usage: yarn generate:img [--target=_staging|release|both] [--version=vX] [--bump]',
        '',
        'Flags:',
        '  --target=...   Choose target environment(s); default _staging; "both" runs both _staging and release.',
        '  --version=...  Override version for this run without persisting.',
        '  --bump         Increment the version in cdn/assetGroupVersions.json for the target(s).',
        '',
        'Examples:',
        '  yarn generate:img --help',
        '  yarn generate:img --target=_staging --bump',
        '  yarn generate:img --target=both --version=v5',
      ].join('\n'),
    );
    return;
  }
  const targets =
    opts.target === 'both'
      ? [
          '_staging',
          'release',
        ]
      : [
          opts.target,
        ];
  await processTargets(targets, opts.versionOverride, opts.bump);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
