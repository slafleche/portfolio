#!/usr/bin/env node
// Vercel-safe HLS builder (100vh ladder), with tmp cleanup + selective builds
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import sharp, { type Sharp } from 'sharp';

type SourceEntryObject = {
  src: string;
  speed?: number;
};

type SourceMapEntry = string | SourceEntryObject;

type SourceMap = Record<string, SourceMapEntry>;

type AssetGroupVersions = Record<string, Record<string, string>>;

type VideoVariant = {
  rung: number;
  height: number;
  bandwidthKbps: number;
  playlistUrl: string;
};

type PosterVariant = {
  w: number;
  url: string;
};

type PosterEntry = {
  name: string;
  hash: string;
  basePath: string;
  dirName: string;
  width: number;
  height: number;
  aspect: number;
  blurDataURL: string;
  variants: Record<string, PosterVariant[]>;
  original: {
    url: string;
    width: number;
    height: number;
  };
};

type FormatSpec = {
  ext: string;
  to: (img: Sharp) => Sharp;
};

type NormalizedEntry = {
  rawName: string;
  name: string;
  src: string;
  speed: number;
  isRemote: boolean;
};

type VideoInfo = {
  name: string;
  dirName: string;
  basePath: string;
  width: number;
  height: number;
  aspect: number;
  duration: number;
  hasAudio: boolean;
  speed: number;
  masterUrl: string;
  posterPath: string;
  posterUrl: string;
  variants: VideoVariant[];
};

type VideoManifestEntry = VideoInfo & {
  poster: PosterEntry;
  hash?: string;
  sourceHash?: string;
  sourceSize?: number;
  sourceUrl?: string;
  source?: string;
};

type VideoManifest = Record<string, VideoManifestEntry>;

type FFprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
};

type FFprobeFormat = {
  duration?: string;
};

type FFprobeResult = {
  streams?: FFprobeStream[];
  format?: FFprobeFormat;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

/* Config -------------------------------------------------------------- */
const SRC_MAP_PATH = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'videos',
  'videoSources.json',
); // { "hero": "<url>", ... }
const LOCAL_VIDEO_DIR = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'videos',
  'localVideoSrc',
);
const TMP_ROOT = path.join(REPO_ROOT, 'tmp', 'cdn');
const DOWNLOAD_ROOT = path.join(TMP_ROOT, 'downloads');
const OUT_ROOT_BASE = TMP_ROOT;
const CATEGORY = 'videos';
const VERSIONS_PATH = path.join(REPO_ROOT, 'cdn', 'assetGroupVersions.json');
const VIDEO_CACHE_PREFIX = 'vid';
const VIDEO_CACHE_HASH_LENGTH = 8;

// 100vh fullscreen hero ladder — 24fps, 2s segments
const LADDER = [
  {
    h: 1440,
    vK: 5200,
    aK: 96,
    profile: 'high',
  },
  {
    h: 1080,
    vK: 3800,
    aK: 96,
    profile: 'high',
  },
  {
    h: 900,
    vK: 2800,
    aK: 96,
    profile: 'main',
  },
  {
    h: 720,
    vK: 1900,
    aK: 96,
    profile: 'main',
  },
  {
    h: 540,
    vK: 1200,
    aK: 64,
    profile: 'main',
  },
  {
    h: 360,
    vK: 700,
    aK: 48,
    profile: 'baseline',
  },
  {
    h: 240,
    vK: 400,
    aK: 32,
    profile: 'baseline',
  },
];

const FPS = 24;
const SEG = 2;
const GOP = FPS * 2;

const BASE_VIDEO_FILTER = [
  'format=yuv420p',
  'gradfun=strength=0.9:radius=16',
  'noise=alls=4:allf=t+u',
].join(','); // shared pre-processing so posters match HLS output

const POSTER_WIDTHS = [
  320,
  480,
  640,
  750,
  828,
  1080,
  1200,
  1920,
];
const POSTER_FORMATS: FormatSpec[] = [
  { ext: 'avif', to: (img) => img.avif({ quality: 50 }) },
  { ext: 'webp', to: (img) => img.webp({ quality: 70 }) },
  {
    ext: 'jpg',
    to: (img) => img.jpeg({ quality: 82, progressive: true }),
  },
];

/* Utility helpers ---------------------------------------------------- */
const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const isErrno = (error: unknown): error is NodeJS.ErrnoException =>
  typeof error === 'object' && error !== null && 'code' in error;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const exists = async (p: string) =>
  !!(await fs
    .access(p)
    .then(() => true)
    .catch(() => false));

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

const toName = (s: string) =>
  s
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase();

function normalizeSourceEntry(rawValue: SourceMapEntry, key: string) {
  if (typeof rawValue === 'string') {
    return {
      src: rawValue,
      speed: 1,
    };
  }
  if (rawValue && typeof rawValue === 'object') {
    const src = typeof rawValue.src === 'string' ? rawValue.src : '';
    if (!src) {
      throw new Error(
        `Source entry "${key}" is missing a valid "src" string.`,
      );
    }
    let speed = 1;
    if (rawValue.speed != null) {
      const parsed = Number(rawValue.speed);
      if (Number.isFinite(parsed) && parsed > 0) {
        speed = parsed;
      } else {
        console.warn(
          `ℹ️ Ignoring invalid speed "${rawValue.speed}" for "${key}". Expected a positive number.`,
        );
      }
    }
    return {
      src,
      speed,
    };
  }
  throw new Error(
    `Unsupported source definition for "${key}". Expected string or object with "src".`,
  );
}

function normalizeDrive(urlStr: string) {
  try {
    const u = new URL(urlStr);
    if (u.hostname === 'drive.google.com') {
      const m =
        u.pathname.match(/\/file\/d\/([^/]+)/) ||
        u.search.match(/id=([^&]+)/);
      if (m && m[1]) {
        return `https://drive.google.com/uc?export=download&id=${m[1]}`;
      }
    }
    return urlStr;
  } catch {
    return urlStr;
  }
}

// Force Dropbox shared links to ?dl=1 (direct download) while preserving other query params.
function toDirectDropboxUrl(urlStr: string) {
  try {
    const u = new URL(urlStr);
    if (
      u.hostname === 'www.dropbox.com' ||
      u.hostname === 'dropbox.com'
    ) {
      u.searchParams.set('dl', '1'); // force direct download
      return u.toString();
    }
    return urlStr;
  } catch {
    return urlStr;
  }
}

function extFromUrlSafe(rawUrl: string) {
  try {
    const u = new URL(rawUrl);
    return path.extname(u.pathname) || '';
  } catch {
    return path.extname(rawUrl) || '';
  }
}

function hashBuffer(buffer: Buffer, length: number) {
  const rawHash = crypto.createHash('sha256').update(buffer).digest('hex');
  return rawHash.slice(0, Math.max(1, length));
}

/* Networking --------------------------------------------------------- */
async function findCachedFile(
  cacheDir: string,
  cacheKey: string,
): Promise<string | null> {
  try {
    const entries = await fs.readdir(cacheDir);
    const match = entries.find((entry) =>
      entry.startsWith(`${cacheKey}.`),
    );
    return match ? path.join(cacheDir, match) : null;
  } catch {
    return null;
  }
}

async function downloadToTemp(
  name: string,
  rawUrl: string,
  cacheDir: string,
  cacheKey: string,
): Promise<{ file: string; bytes: number }> {
  let urlStr = (rawUrl || '').trim();
  if (!urlStr) throw new Error(`Empty URL for "${name}"`);

  urlStr = normalizeDrive(urlStr);
  urlStr = toDirectDropboxUrl(urlStr);

  await fs.mkdir(cacheDir, {
    recursive: true,
  });
  const cached = await findCachedFile(cacheDir, cacheKey);
  if (cached && (await exists(cached))) {
    const stat = await fs.stat(cached);
    console.log(`ℹ︎ Using cached download → ${cached}`);
    return {
      file: cached,
      bytes: stat.size,
    };
  }

  const res = await fetch(urlStr, {
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${urlStr}`);

  const ct =
    res.headers
      .get('content-type')
      ?.split(';')[0]
      ?.trim()
      .toLowerCase() || '';
  const buf = Buffer.from(await res.arrayBuffer());

  const looksHtml = buf
    .slice(0, 64)
    .toString('utf8')
    .includes('<!DOCTYPE html');
  const okCT =
    ct.startsWith('video/') ||
    ct === 'application/octet-stream' ||
    ct === 'application/mp4' ||
    ct === 'application/x-mp4';
  if (!okCT || looksHtml) {
    const preview = buf
      .slice(0, 160)
      .toString('utf8')
      .replace(/\s+/g, ' ')
      .slice(0, 120);
    throw new Error(
      `Non-video response for "${name}": content-type="${ct}", bytes=${buf.length}. ` +
        `If this is Dropbox, ensure the link ends with "?dl=1". First bytes: ${preview}`,
    );
  }

  const extFromCT = ct.includes('mp4')
    ? '.mp4'
    : ct.includes('webm')
      ? '.webm'
      : ct.includes('quicktime')
        ? '.mov'
        : '';
  const ext = extFromCT || extFromUrlSafe(urlStr) || '.mp4';

  const file = path.join(cacheDir, `${cacheKey}${ext}`);
  await fs.writeFile(file, buf);
  return {
    file,
    bytes: buf.length,
  };
}

/* FFprobe / FFmpeg --------------------------------------------------- */
async function ffprobeJSON(inputPath: string): Promise<FFprobeResult> {
  const { stdout } = await execa(ffprobeStatic.path, [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    inputPath,
  ]);
  const meta = JSON.parse(stdout || '{}') as FFprobeResult;
  const streams = Array.isArray(meta.streams) ? meta.streams : [];
  if (streams.length === 0) {
    throw new Error(
      `ffprobe: no streams found in "${inputPath}". File may be corrupt or not a video.`,
    );
  }
  return {
    ...meta,
    streams,
  };
}

// Deband, add subtle grain, then split/scale ladder outputs (order matters).
function buildFilterAndMaps(speed = 1) {
  const splitN = LADDER.length;
  const v = Array.from({ length: splitN }, (_, i) => `v${i + 1}`);
  const out = v.map((label) => `${label}out`);

  const speedFilter =
    typeof speed === 'number' && speed !== 1
      ? `setpts=${(1 / speed).toFixed(6)}*PTS,`
      : '';

  const split =
    `[0:v]${speedFilter}${BASE_VIDEO_FILTER},` +
    `split=${splitN}` +
    v.map((x) => `[${x}]`).join('') +
    ';';

  const scales = v
    .map(
      (x, i) =>
        ` [${x}]scale=-2:${LADDER[i].h}:flags=lanczos[${out[i]}];`,
    )
    .join('');

  const maps = [];
  for (let i = 0; i < out.length; i++) {
    maps.push('-map', `[${out[i]}]`);
  }

  const varMap = LADDER.map((_, i) => `v:${i}`).join(' ');

  return {
    filter: split + scales,
    maps,
    varMap,
  };
}

async function removeHashedVideoDirs(name: string, outRoot: string) {
  const prefix = `${VIDEO_CACHE_PREFIX}-${name}-`;
  let entries: string[] = [];
  try {
    entries = await fs.readdir(outRoot);
  } catch (error) {
    if (isErrno(error) && error.code === 'ENOENT') return;
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

async function buildHLS(
  srcPath: string,
  {
    name,
    slug,
    speed = 1,
    outRoot,
    speedLabel,
  }: {
    name: string;
    slug: string;
    speed?: number;
    outRoot: string;
    speedLabel: string;
  },
): Promise<VideoInfo> {
  const outDir = path.join(outRoot, speedLabel, slug);
  await fs.mkdir(outDir, {
    recursive: true,
  });

  const meta = await ffprobeJSON(srcPath);
  const v = meta.streams.find((s) => s.codec_type === 'video');
  const width = v?.width ?? 0;
  const height = v?.height ?? 0;
  const originalDuration = Number(meta.format?.duration ?? 0);
  const duration =
    speed && speed !== 0
      ? originalDuration / speed
      : originalDuration;

  const { filter, maps, varMap } = buildFilterAndMaps(speed);

  for (let i = 0; i < LADDER.length; i++) {
    await fs.mkdir(path.join(outDir, `out_${i}`), {
      recursive: true,
    });
  }

  const rungOpts = LADDER.flatMap((r, i) => [
    '-c:v',
    'libx264',
    '-profile:v',
    r.profile,
    '-pix_fmt',
    'yuv420p',

    // preserve gradients
    '-tune',
    'grain',

    // extra x264 guidance (conservative)
    '-x264-params',
    'aq-mode=3:aq-strength=1.1:deblock=-1,-1:psy-rd=0.6:vbv-init=0.9',

    '-preset',
    'veryfast', // change to 'slow' for better quality (slower)
    '-r',
    String(FPS),
    '-g',
    String(GOP),
    '-keyint_min',
    String(GOP),
    '-sc_threshold',
    '0',

    `-b:v:${i}`,
    `${r.vK}k`,
    `-maxrate:${i}`,
    `${Math.round(r.vK * 1.1)}k`,
    `-bufsize:${i}`,
    `${r.vK * 2}k`,

    // Tag BT.709 to avoid player color surprises
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-colorspace',
    'bt709',
  ]);

  const args = [
    '-nostdin',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    srcPath,

    // filter graph (deband/dither + grain + scale ladder)
    '-filter_complex',
    filter,
    ...maps,

    ...rungOpts,
    '-an',

    '-f',
    'hls',
    '-hls_time',
    String(SEG),
    '-hls_playlist_type',
    'vod',
    '-hls_flags',
    'independent_segments',
    '-var_stream_map',
    varMap,
    '-master_pl_name',
    'master.m3u8',
    '-hls_segment_filename',
    path.join(outDir, 'out_%v', 'seg_%03d.ts'),
    path.join(outDir, 'out_%v', 'index.m3u8'),
  ];

  console.log(`↻ ffmpeg → ${name}`);
  await execa(ffmpegStatic, args, {
    stdio: 'inherit',
  });

  const primarySegment = path.join(outDir, 'out_0', 'seg_000.ts');
  const fallbackSegment = path.join(outDir, 'out_0', 'seg_001.ts');
  let posterSource = primarySegment;
  if (!(await exists(posterSource))) {
    if (await exists(fallbackSegment)) {
      posterSource = fallbackSegment;
    } else {
      posterSource = srcPath;
    }
  }

  const poster = path.join(outDir, 'poster.png');
  await fs
    .rm(path.join(outDir, 'poster.jpg'), {
      force: true,
    })
    .catch(() => {});
  await execa(ffmpegStatic, [
    '-nostdin',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    posterSource,
    '-frames:v',
    '1',
    '-vf',
    'scale=-2:720:flags=lanczos',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-colorspace',
    'bt709',
    '-y',
    poster,
  ]);

  const relBasePath = `${speedLabel}/${slug}`;

  return {
    name,
    dirName: relBasePath,
    basePath: relBasePath,
    width,
    height,
    aspect: height ? width / height : 0,
    duration,
    hasAudio: false,
    speed,
    masterUrl: `${relBasePath}/master.m3u8`,
    posterPath: poster,
    posterUrl: `${relBasePath}/poster.png`,
    variants: LADDER.map((r, i) => ({
      rung: i,
      height: r.h,
      bandwidthKbps: r.vK,
      playlistUrl: `${relBasePath}/out_${i}/index.m3u8`,
    })),
  };
}

async function generatePosterVariants(
  posterPath: string,
  outDir: string,
  basePathRoot: string,
  namePrefix: string,
): Promise<PosterEntry> {
  const img = sharp(posterPath).rotate();
  const meta = await img.metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;
  if (!srcW || !srcH) {
    throw new Error(`Poster has invalid dimensions: ${posterPath}`);
  }

  const { data: originalBuffer } = await img
    .clone()
    .toFormat('png')
    .toBuffer({ resolveWithObject: true });
  const hash = hashBuffer(originalBuffer, VIDEO_CACHE_HASH_LENGTH);
  const posterDirName = `poster-${hash}`;
  const posterDir = path.join(outDir, posterDirName);
  await fs.rm(posterDir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(posterDir, { recursive: true });

  const lqipW = Math.min(24, srcW);
  const lqip = await img
    .clone()
    .resize({ width: lqipW })
    .blur()
    .jpeg({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/jpeg;base64,${lqip.toString('base64')}`;

  const basePath = `${basePathRoot}/${posterDirName}`;
  const targetWidths = POSTER_WIDTHS.filter((w) => w <= srcW);
  const variants: Record<string, PosterVariant[]> = {};

  for (const { ext, to } of POSTER_FORMATS) {
    const list: PosterVariant[] = [];
    for (const w of targetWidths) {
      const fileName = `${w}.${ext}`;
      const outPath = path.join(posterDir, fileName);
      await to(img.clone().resize({ width: w })).toFile(outPath);
      list.push({ w, url: `${basePath}/${fileName}` });
    }
    variants[ext] = list;
  }

  const origFile = 'orig.png';
  await fs.writeFile(path.join(posterDir, origFile), originalBuffer);

  return {
    name: `${namePrefix}-poster`,
    hash,
    basePath,
    dirName: posterDirName,
    width: srcW,
    height: srcH,
    aspect: srcW / srcH,
    blurDataURL,
    variants,
    original: {
      url: `${basePath}/${origFile}`,
      width: srcW,
      height: srcH,
    },
  };
}

/* CLI entry ---------------------------------------------------------- */
void (async () => {
  const args = process.argv.slice(2);
  const targetsArg = args.filter((a) => !a.startsWith('--'));
  const targetNames = targetsArg.length > 0 ? targetsArg.map(toName) : [];

  const opts = {
    target: '_staging',
    versionOverride: null,
    postersOnly: false,
  };
  for (const arg of args) {
    if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'release') opts.target = t;
    } else if (arg.startsWith('--version=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) opts.versionOverride = v;
    } else if (arg === '--posters-only') {
      opts.postersOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        [
          'Usage: yarn generate:videos [--target=_staging|release] [--version=vX] [name ...]',
          '',
          'Generates video outputs into tmp/cdn/<target>/videos/<version>/s<speed>/',
          'Use --posters-only to regenerate poster variants from existing outputs.',
          'Inputs:',
          '  - Local files under cdn/media/videos/localVideoSrc',
          '  - Remote sources in cdn/media/videos/videoSources.json',
          '',
          'Args:',
          '  --target=...   Target environment (_staging or release); default _staging.',
          '  --version=...  Override version (otherwise uses cdn/assetGroupVersions.json for videos).',
          '  --posters-only  Regenerate poster variants for existing videos (errors if outputs missing).',
          '  name ...       Optional list of video keys to build (by name); defaults to all.',
        ].join('\n'),
      );
      process.exit(0);
    }
  }

  const parsedVersions = await readJsonFile<AssetGroupVersions>(
    VERSIONS_PATH,
    {},
  );
  const version =
    opts.versionOverride ||
    (parsedVersions?.[opts.target]?.[CATEGORY] ?? 'v1');

  const outRoot = path.join(OUT_ROOT_BASE, opts.target, CATEGORY, version);
  const tempDownloadDir = path.join(
    DOWNLOAD_ROOT,
    opts.target,
    version,
    CATEGORY,
  );

  await fs.mkdir(outRoot, { recursive: true });
  await fs.mkdir(tempDownloadDir, { recursive: true });

  const manifest: VideoManifest = {};
  const existingManifestPath = path.join(outRoot, 'manifest.json');
  const existingManifest = await readJsonFile<VideoManifest>(
    existingManifestPath,
    {},
  );

  const urlMap = await readJsonFile<SourceMap>(SRC_MAP_PATH, {});
  const localEntries: Array<{ rawName: string; file: string }> = [];
  try {
    const localFiles = await fs.readdir(LOCAL_VIDEO_DIR);
    for (const file of localFiles) {
      if (file === '.gitkeep') continue;
      const full = path.join(LOCAL_VIDEO_DIR, file);
      const stat = await fs.stat(full);
      if (!stat.isFile()) continue;
      const ext = path.extname(file).toLowerCase();
      if (!ext || !['.mp4', '.mov', '.webm', '.mkv'].includes(ext)) continue;
      localEntries.push({ rawName: path.parse(file).name, file: full });
    }
  } catch (error) {
    if (!isErrno(error) || error.code !== 'ENOENT') throw error;
  }

  const normalizedRemote: NormalizedEntry[] = Object.entries(urlMap).map(
    ([rawName, rawValue]) => {
      const entry = normalizeSourceEntry(rawValue, rawName);
      return { rawName, name: toName(rawName), ...entry, isRemote: true };
    },
  );

  const normalizedLocal: NormalizedEntry[] = localEntries.map(
    ({ rawName, file }) => ({
      rawName,
      name: toName(rawName),
      src: file,
      speed: 1,
      isRemote: false,
    }),
  );

  const seenNames = new Set<string>();
  const allEntries: NormalizedEntry[] = [
    ...normalizedRemote,
    ...normalizedLocal,
  ].filter((entry) => {
    if (seenNames.has(entry.name)) {
      throw new Error(`Duplicate video key "${entry.name}" between sources.`);
    }
    seenNames.add(entry.name);
    return targetNames.length > 0 ? targetNames.includes(entry.name) : true;
  });

  if (allEntries.length === 0) {
    console.log('ℹ️ No videos to process for selection:', targetNames.join(', ') || 'all');
    process.exit(0);
  }

  if (opts.postersOnly) {
    if (!(await exists(existingManifestPath))) {
      throw new Error(
        `Missing manifest at ${existingManifestPath}; run generate:videos first.`,
      );
    }
    for (const entry of allEntries) {
      const prev = existingManifest?.[entry.name];
      if (!prev?.dirName) {
        throw new Error(
          `Missing manifest entry for "${entry.name}" in ${existingManifestPath}.`,
        );
      }
      const outDir = path.join(outRoot, prev.dirName);
      const masterPath = path.join(outDir, 'master.m3u8');
      if (!(await exists(masterPath))) {
        throw new Error(
          `Missing video outputs for "${entry.name}" at ${outDir}.`,
        );
      }
      const primarySegment = path.join(outDir, 'out_0', 'seg_000.ts');
      const fallbackSegment = path.join(outDir, 'out_0', 'seg_001.ts');
      let posterSource = primarySegment;
      if (!(await exists(posterSource))) {
        if (await exists(fallbackSegment)) {
          posterSource = fallbackSegment;
        } else {
          throw new Error(
            `Missing video segments for "${entry.name}" in ${outDir}.`,
          );
        }
      }

      const posterPath = path.join(outDir, 'poster.png');
      await execa(ffmpegStatic, [
        '-nostdin',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        posterSource,
        '-frames:v',
        '1',
        '-vf',
        'scale=-2:720:flags=lanczos',
        '-color_primaries',
        'bt709',
        '-color_trc',
        'bt709',
        '-colorspace',
        'bt709',
        '-y',
        posterPath,
      ]);

      const namePrefix = prev.dirName.split('/').pop() ?? prev.dirName;
      const posterEntry = await generatePosterVariants(
        posterPath,
        outDir,
        prev.dirName,
        namePrefix,
      );
      manifest[entry.name] = {
        ...prev,
        poster: posterEntry,
        posterUrl: posterEntry.original.url,
      };
      console.log(`✓ Regenerated poster for ${entry.name}`);
    }

    const manifestPath = path.join(outRoot, 'manifest.json');
    await fs.writeFile(
      manifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log(`\n✓ Wrote manifest → ${manifestPath}`);
    console.log(`✓ Outputs under → ${outRoot}`);
    return;
  }

  for (const { rawName, name, src, speed, isRemote } of allEntries) {
    console.log(
      `\n▶ ${name}${speed !== 1 ? `  (speed ×${speed.toFixed(2)})` : ''}`,
    );
    try {
      const effectiveSpeed =
        typeof speed === 'number' && speed > 0 ? speed : 1;
      const speedLabel = `s${Number(effectiveSpeed).toString().replace('.', 'p')}`;

      const normalizedSrc = isRemote
        ? toDirectDropboxUrl(normalizeDrive(src))
        : src;
      const configString = `${name}\n${normalizedSrc}\n${effectiveSpeed}\n${version}`;
      const configHash = sha256(configString);
      const shortHash = configHash.slice(
        0,
        VIDEO_CACHE_HASH_LENGTH,
      );
      const slug = `${VIDEO_CACHE_PREFIX}-${name}-${shortHash}`;
      const prev = existingManifest?.[name];
      const hasSameSpeed = Number(prev?.speed ?? 1) === effectiveSpeed;
      const hasSameConfig =
        typeof prev?.sourceHash === 'string' &&
        prev.sourceHash === configHash;
      const prevDir = prev?.dirName
        ? path.join(outRoot, prev.dirName, 'master.m3u8')
        : null;
      const prevPosterPath =
        prev?.poster?.original?.url
          ? path.join(outRoot, prev.poster.original.url)
          : null;

      if (!hasSameSpeed) {
        // Speed change always forces a rebuild.
      } else if (
        hasSameConfig &&
        prevDir &&
        (await exists(prevDir)) &&
        (!prevPosterPath || (await exists(prevPosterPath)))
      ) {
        console.log(
          'ℹ︎ Video source unchanged; using existing outputs. Skipping download and transcode.',
        );
        manifest[name] = prev;
        continue;
      }

      const sourceHash = sha256(normalizedSrc).slice(0, 12);
      const cacheKey = `${name}-${sourceHash}`;
      const { file, bytes } = isRemote
        ? await downloadToTemp(name, normalizedSrc, tempDownloadDir, cacheKey)
        : {
            file: src,
            bytes: (await fs.stat(src)).size,
          };
      const speedRoot = path.join(outRoot, speedLabel);
      await fs.mkdir(speedRoot, { recursive: true });
      await removeHashedVideoDirs(name, speedRoot);

      const info = await buildHLS(file, {
        name,
        slug,
        speed: effectiveSpeed,
        outRoot,
        speedLabel,
      });
      const posterEntry = await generatePosterVariants(
        info.posterPath,
        path.join(outRoot, info.dirName),
        info.dirName,
        slug,
      );
      manifest[name] = {
        ...info,
        poster: posterEntry,
        posterUrl: posterEntry.original.url,
        hash: shortHash,
        sourceHash: configHash,
        sourceSize: bytes,
        sourceUrl: normalizedSrc,
        source: isRemote ? normalizedSrc : `local:${rawName}`,
      };
      console.log(
        `✓ Built ${name}  ${info.width}x${info.height}  ${Math.round(info.duration)}s`,
      );
    } catch (err) {
      console.error(`✗ ${name} failed:`, getErrorMessage(err));
    }
  }

  const manifestNames = new Set(Object.keys(manifest));
  const staleNames = new Set(Object.keys(existingManifest ?? {}));
  for (const name of manifestNames) staleNames.delete(name);
  if (staleNames.size > 0) {
    console.log(
      `→ Removing ${staleNames.size} stale video${
        staleNames.size === 1 ? '' : 's'
      } from ${outRoot}`,
    );
    for (const name of staleNames) {
      const prev = existingManifest?.[name];
      const speedLabel =
        typeof prev?.dirName === 'string'
          ? prev.dirName.split('/')[0]
          : null;
      if (!speedLabel) continue;
      await removeHashedVideoDirs(name, path.join(outRoot, speedLabel));
    }
  }

  const manifestPath = path.join(outRoot, 'manifest.json');
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`\n✓ Wrote manifest → ${manifestPath}`);
  console.log(`✓ Outputs under → ${outRoot}`);

  // Keep cached downloads for future runs.
})();
