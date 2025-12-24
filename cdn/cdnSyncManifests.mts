import { config as loadEnv } from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

loadEnv({ path: '.env.local', override: true });
loadEnv({ path: '.env', override: true });
loadEnv({ path: '../.env.local', override: true });
loadEnv({ path: '../.env', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const TMP_ROOT = path.join(REPO_ROOT, 'tmp', 'cdn');

type Target = '_staging' | 'release';
type AssetKind = 'images' | 'fonts' | 'videos';
type Versions = Record<AssetKind, string>;

type ParsedArgs = {
  target?: Target;
  kinds: Set<AssetKind>;
  version?: string;
  yes: boolean;
  manifestOnly: boolean;
  help: boolean;
};

const PREFIX_BY_TARGET: Record<Target, string> = {
  release: 'release',
  _staging: '_staging',
};

const MIME_MAP: Record<string, string> = {
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.mpd': 'application/dash+xml',
};

type RequiredEnv = {
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
  R2_BUCKET?: string;
  CDN_PUBLIC_BASE_URL?: string;
};

function requireEnv(name: keyof RequiredEnv, env: RequiredEnv): string {
  const value = env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var ${name}`);
  }
  return value.trim();
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${message} [y/N]: `);
  await rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const kinds = new Set<AssetKind>();
  let target: Target | undefined;
  let version: string | undefined;
  let yes = false;
  let manifestOnly = false;
  let help = false;

  for (const arg of args) {
    if (arg === '--images') kinds.add('images');
    else if (arg === '--fonts') kinds.add('fonts');
    else if (arg === '--videos') kinds.add('videos');
    else if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'release') target = t;
      else if (t === 's') target = '_staging';
      else if (t === 'r') target = 'release';
    } else if (arg.startsWith('--version=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) version = v;
    } else if (arg === '--yes' || arg === '-y') {
      yes = true;
    } else if (arg === '--manifest-only') {
      manifestOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    }
  }

  if (kinds.size === 0) {
    kinds.add('images');
    kinds.add('fonts');
    kinds.add('videos');
  }

  return { target, kinds, version, yes, manifestOnly, help };
}

async function pickTarget(): Promise<Target> {
  const stagingPath = path.join(TMP_ROOT, '_staging');
  const releasePath = path.join(TMP_ROOT, 'release');
  const stagingExists = await fileExists(stagingPath);
  const releaseExists = await fileExists(releasePath);

  if (stagingExists && releaseExists) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      'Found manifests for both _staging and release. Use which? [_staging (s)/release (r)]: ',
    );
    await rl.close();
    const t = answer.trim();
    if (t === 'release') return 'release';
    if (t === 'r') return 'release';
    if (t === 's') return '_staging';
    return '_staging';
  }

  if (releaseExists) return 'release';
  return '_staging';
}

async function resolveVersions(
  target: Target,
  override?: string,
): Promise<Versions> {
  if (override) {
    return {
      images: override,
      fonts: override,
      videos: override,
    };
  }
  const versionsPath = path.join(REPO_ROOT, 'cdn', 'assetGroupVersions.json');
  const raw = await fs.readFile(versionsPath, 'utf8').catch(() => null);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<
        Record<Target, { images?: string; fonts?: string; videos?: string }>
      >;
      const images = parsed?.[target]?.images;
      const fonts = parsed?.[target]?.fonts;
      const videos = parsed?.[target]?.videos;
      return {
        images:
          typeof images === 'string' && images.trim()
            ? images.trim()
            : 'v1',
        fonts: typeof fonts === 'string' && fonts.trim() ? fonts.trim() : 'v1',
        videos: typeof videos === 'string' && videos.trim() ? videos.trim() : 'v1',
      };
    } catch {
      // ignore
    }
  }
  return {
    images: 'v1',
    fonts: 'v1',
    videos: 'v1',
  };
}

function sanitizeBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

function buildPublicUrl(base: string, key: string): string {
  const normalizedBase = sanitizeBaseUrl(base);
  return `${normalizedBase}/${key}`;
}

async function listFilesRecursive(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(full);
      files.push(...nested);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function sha256(buffer: Buffer | string): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function writeHashesFile(versionRoot: string): Promise<string | null> {
  const files = await listFilesRecursive(versionRoot).catch(() => null);
  if (!files) return null;
  const relative = files.map((f) => path.relative(versionRoot, f));
  const fileHashes: Record<string, string> = {};
  for (const rel of relative) {
    const buf = await fs.readFile(path.join(versionRoot, rel));
    fileHashes[rel] = sha256(buf);
  }
  const combined = sha256(
    relative
      .sort()
      .map((rel) => `${rel}:${fileHashes[rel]}`)
      .join('\n'),
  );
  const hashesPath = path.join(versionRoot, 'hashes.json');
  const payload = { combined, files: fileHashes };
  await fs.writeFile(hashesPath, `${JSON.stringify(payload, null, 2)}\n`);
  return hashesPath;
}

function contentTypeFor(filePath: string): string | undefined {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext];
}

async function syncKind(options: {
  target: Target;
  kind: AssetKind;
  versions: Versions;
  yes: boolean;
  manifestOnly: boolean;
  s3?: S3Client;
  bucket?: string;
  publicBase: string;
}): Promise<void> {
  const {
    target,
    kind,
    versions,
    yes,
    manifestOnly,
    s3,
    bucket,
    publicBase,
  } = options;
  const version = versions[kind];
  const versionRoot = path.join(TMP_ROOT, target, kind, version);
  const manifestPath = path.join(versionRoot, 'manifest.json');
  const prefix = PREFIX_BY_TARGET[target];
  const storageKind = kind;

  if (!(await fileExists(manifestPath))) {
    if (manifestOnly) {
      console.log(
        `ℹ︎ Manifest-only mode: missing manifest at ${manifestPath}, skipping ${kind}.`,
      );
      return;
    }
    throw new Error(`Missing manifest at ${manifestPath}`);
  }

  await writeHashesFile(versionRoot).catch(() => {
    /* non-blocking */
  });

  if (!manifestOnly) {
    if (!s3 || !bucket) {
      throw new Error('Missing S3 client or bucket for upload step.');
    }
    const files = await listFilesRecursive(versionRoot);
    const uploadFiles = files.filter((filePath) => {
      const base = path.basename(filePath);
      if (base === 'manifest.json' || base === 'hashes.json') return false;
      if (kind === 'fonts' && base === 'fonts.config.json') return false;
      return true;
    });

    const toKey = (fullPath: string) => {
      const rel = path.relative(versionRoot, fullPath).split(path.sep).join('/');
      return `${prefix}/${storageKind}/${version}/${rel}`;
    };

    const headExists = async (key: string) => {
      try {
        await s3.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
        return true;
      } catch {
        return false;
      }
    };

    for (const filePath of uploadFiles) {
      const key = toKey(filePath);
      const exists = await headExists(key);
      if (exists && !yes) {
        const ok = await confirm(
          `"${key}" exists in bucket "${bucket}". Overwrite?`,
        );
        if (!ok) {
          console.log(`Skipped ${key}`);
          continue;
        }
      }

      const body = await fs.readFile(filePath);
      const ContentType = contentTypeFor(filePath);
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType,
        }),
      );

      const url = buildPublicUrl(publicBase, key);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      }).catch((error) => {
        clearTimeout(timeout);
        throw error;
      });
      clearTimeout(timeout);
      if (!res || !res.ok) {
        throw new Error(
          `CDN URL not reachable for ${key}: ${
            res ? res.status : 'no response'
          }`,
        );
      }
      console.log(`✓ Uploaded ${key}`);
    }
  } else {
    console.log('ℹ︎ Manifest-only mode: skipping asset uploads.');
  }

  const rawManifest = await fs.readFile(manifestPath, 'utf8');
  const rewriteUrl = (u: string) => {
    const rel = u.startsWith('/') ? u.slice(1) : u;
    const key = `${prefix}/${storageKind}/${version}/${rel}`;
    return buildPublicUrl(publicBase, key);
  };

  const publicManifestPath =
    kind === 'fonts'
      ? path.join(
          REPO_ROOT,
          'src',
          'data',
          'generated',
          'fonts.manifest.gen.json',
        )
      : path.join(
          REPO_ROOT,
          'public',
          'cdn',
          storageKind,
          'manifest.json',
        );

  await fs.mkdir(path.dirname(publicManifestPath), { recursive: true });

  if (kind === 'fonts') {
    const parsed = JSON.parse(rawManifest) as Record<
      string,
      {
        type: 'selfHosted';
        src: string;
        weights?: number[];
        ital?: boolean;
        axes?: Record<string, string>;
        dirName: string;
        files: { fileName: string; url: string }[];
      }
    >;
    const rewritten: typeof parsed = {};
    for (const [name, entry] of Object.entries(parsed)) {
      const { src: _src, ...rest } = entry;
      rewritten[name] = {
        ...rest,
        files: (entry.files ?? []).map((file) => ({
          ...file,
          url: rewriteUrl(file.url),
        })),
      };
    }
    await fs.writeFile(
      publicManifestPath,
      `${JSON.stringify(rewritten, null, 2)}\n`,
    );
  } else if (kind === 'videos') {
    const parsed = JSON.parse(rawManifest) as Record<
      string,
      {
        masterUrl?: string;
        posterUrl?: string;
        variants?: { playlistUrl?: string }[];
        poster?: {
          variants?: Record<string, { w: number; url: string }[]>;
          original?: { url: string; width: number; height: number };
          [key: string]: unknown;
        };
        [key: string]: unknown;
      }
    >;
    const rewritten: typeof parsed = {};
    for (const [name, entry] of Object.entries(parsed)) {
      const { source, sourceUrl, ...rest } = entry;
      const variants = Array.isArray(entry.variants)
        ? entry.variants.map((variant) => ({
            ...variant,
            playlistUrl: variant.playlistUrl
              ? rewriteUrl(variant.playlistUrl)
              : variant.playlistUrl,
          }))
        : entry.variants;
      let poster = entry.poster;
      if (poster) {
        const posterVariants: typeof poster.variants = {};
        for (const [fmt, arr] of Object.entries(poster.variants ?? {})) {
          posterVariants[fmt] = (arr ?? []).map((variant) => ({
            ...variant,
            url: rewriteUrl(variant.url),
          }));
        }
        poster = {
          ...poster,
          variants: posterVariants,
          original: poster.original
            ? {
                ...poster.original,
                url: rewriteUrl(poster.original.url),
              }
            : poster.original,
        };
      }
      rewritten[name] = {
        ...rest,
        masterUrl: entry.masterUrl
          ? rewriteUrl(entry.masterUrl)
          : entry.masterUrl,
        posterUrl: entry.posterUrl
          ? rewriteUrl(entry.posterUrl)
          : entry.posterUrl,
        variants,
        poster,
      };
    }
    await fs.writeFile(
      publicManifestPath,
      `${JSON.stringify(rewritten, null, 2)}\n`,
    );
  } else {
    const parsed = JSON.parse(rawManifest) as Record<
      string,
      {
        name: string;
        variants: Record<string, { w: number; url: string }[]>;
        original: { url: string; width: number; height: number };
        [key: string]: unknown;
      }
    >;
    const rewritten: typeof parsed = {};
    for (const [name, entry] of Object.entries(parsed)) {
      const variants: typeof entry.variants = {};
      for (const [fmt, arr] of Object.entries(entry.variants ?? {})) {
        variants[fmt] = (arr ?? []).map((variant) => ({
          ...variant,
          url: rewriteUrl(variant.url),
        }));
      }
      rewritten[name] = {
        ...entry,
        variants,
        original: {
          ...entry.original,
          url: rewriteUrl(entry.original.url),
        },
      };
    }
    await fs.writeFile(
      publicManifestPath,
      `${JSON.stringify(rewritten, null, 2)}\n`,
    );
  }

  console.log(`✓ Wrote manifest to ${publicManifestPath}`);
  console.log(
    'ℹ︎ Manifest written locally only; CDN manifest upload skipped by design.',
  );
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log(
      [
        'Usage: yarn --cwd cdn cdn:sync-manifests [--target=_staging|release] [--version=vX] [--images] [--fonts] [--videos] [--yes]',
        '',
        'Uploads assets from tmp/cdn/<target>/<kind>/<version>/ to CDN (prefix: release|_staging), verifies CDN URLs, rewrites manifest URLs to CDN paths, and writes a tracked manifest locally (images/videos under public/cdn/<kind>/manifest.json, fonts under src/data/generated/fonts.manifest.gen.json).',
        '',
        'Flags:',
        '  --target=...   Choose _staging (or s) or release (or r); default is auto-pick if both exist.',
        '  --version=...  Override version for all kinds (otherwise uses cdn/assetGroupVersions.json).',
        '  --images       Include images manifest (default on if no kinds specified).',
        '  --fonts        Include fonts manifest (default on if no kinds specified).',
        '  --videos      Include video manifest (default on if no kinds specified).',
        '  --manifest-only  Skip uploading assets; only rewrite/write manifest locally.',
        '  --yes, -y      Skip confirmation prompts for overwriting CDN objects.',
        '  --help, -h     Show this help.',
        '',
        'Requires env: CDN_PUBLIC_BASE_URL (or R2_ENDPOINT for fallback). Uploads require R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY.',
      ].join('\n'),
    );
    return;
  }

  const env = process.env as RequiredEnv;
  const publicBase = sanitizeBaseUrl(
    env.CDN_PUBLIC_BASE_URL ?? env.R2_ENDPOINT ?? '',
  );
  if (!publicBase) {
    throw new Error(
      'Missing CDN_PUBLIC_BASE_URL (or R2_ENDPOINT fallback) for manifest rewriting.',
    );
  }

  let bucket: string | undefined;
  let s3: S3Client | undefined;
  if (!args.manifestOnly) {
    bucket = requireEnv('R2_BUCKET', env);
    const endpoint = requireEnv('R2_ENDPOINT', env);
    const accessKeyId = requireEnv('R2_ACCESS_KEY_ID', env);
    const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY', env);

    s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  const target = args.target ?? (await pickTarget());
  const versions = await resolveVersions(target, args.version);

  for (const kind of args.kinds) {
    await syncKind({
      target,
      kind,
      versions,
      yes: args.yes,
      manifestOnly: args.manifestOnly,
      s3,
      bucket,
      publicBase,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
