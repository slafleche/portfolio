#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

const GOOGLE_FONTS_PATH = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'fonts',
  'localFontsSrc',
  'googleFonts.json',
);
const SELF_HOSTED_PATH = path.join(
  REPO_ROOT,
  'cdn',
  'media',
  'fonts',
  'selfhostedFontsSources.json',
);
const VERSIONS_PATH = path.join(
  REPO_ROOT,
  'cdn',
  'assetGroupVersions.json',
);
const TMP_ROOT = path.join(REPO_ROOT, 'tmp', 'cdn');
const DOWNLOAD_ROOT = path.join(TMP_ROOT, 'downloads');
const CATEGORY = 'fonts';

type GoogleEntry = {
  type?: 'googleFonts';
  weights?: string;
  ital?: boolean;
  axes?: Record<string, string>;
};

type SelfHostedEntry = {
  src: string;
  weights?: number[];
  ital?: boolean;
  axes?: Record<string, string>;
};

type FontsConfigEntry = GoogleEntry & { type?: string } & SelfHostedEntry;
type FontsConfig = Record<string, FontsConfigEntry>;

const ALLOWED_EXTENSIONS = new Set([
  '.woff',
  '.woff2',
  '.otf',
  '.ttf',
  '.eot',
  '.json',
]);
const DOWNLOADABLE_EXTENSIONS = new Set([
  '.woff',
  '.woff2',
  '.otf',
  '.ttf',
  '.eot',
  '.json',
]);
const HASH_FILENAME = 'hashes.json';

async function readJson<T>(pathname: string): Promise<T> {
  const raw = await fs.readFile(pathname, 'utf8');
  return JSON.parse(raw) as T;
}

async function writeJsonAtomic(pathname: string, data: unknown) {
  const dir = path.dirname(pathname);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${pathname}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmpPath, pathname);
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function ensureRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

async function copyDirFiltered(
  srcDir: string,
  destDir: string,
  allowExt: Set<string>,
): Promise<void> {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirFiltered(srcPath, destPath, allowExt);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowExt.has(ext)) continue;
    await fs.copyFile(srcPath, destPath);
  }
}

const normalizeKey = (key: string) => key.replace(/\s+/g, '-');

const isLikelyHtml = (buffer: Buffer) => {
  const snippet = buffer.slice(0, 200).toString('utf8').toLowerCase();
  return snippet.includes('<!doctype html') || snippet.includes('<html');
};

const isLikelyZip = (buffer: Buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x50 &&
  buffer[1] === 0x4b &&
  buffer[2] === 0x03 &&
  buffer[3] === 0x04;

const normalizeDropboxListingUrl = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    if (
      u.hostname === 'www.dropbox.com' ||
      u.hostname === 'dropbox.com'
    ) {
      u.hostname = 'www.dropbox.com';
      u.searchParams.set('dl', '0');
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
};

const toDropboxDownloadUrl = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    if (u.hostname === 'dl.dropboxusercontent.com') {
      u.hostname = 'www.dropbox.com';
    }
    if (
      u.hostname === 'www.dropbox.com' ||
      u.hostname === 'dropbox.com'
    ) {
      u.hostname = 'www.dropbox.com';
      u.searchParams.set('dl', '1');
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
};

const toDirectDropboxUrl = (rawUrl: string) => {
  try {
    const u = new URL(rawUrl);
    if (
      u.hostname === 'www.dropbox.com' ||
      u.hostname === 'dropbox.com'
    ) {
      u.hostname = 'dl.dropboxusercontent.com';
      u.searchParams.set('dl', '1');
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
};

const extractFileLinks = (html: string, baseUrl: string): string[] => {
  const links = new Set<string>();
  const anchorRegex = /href="([^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html))) {
    const href = match[1];
    const isFont = /\.(woff2?|otf|ttf|eot)(?:\?|$)/i.test(href);
    const isMeta = /metaData\.json(?:\?|$)/i.test(href);
    if (!isFont && !isMeta) continue;
    try {
      const abs = new URL(href, baseUrl).toString();
      links.add(abs);
    } catch {
      // ignore bad URLs
    }
  }
  return Array.from(links);
};

const extractZipBuffer = async (buffer: Buffer, destination: string) => {
  const tempZip = path.join(
    destination,
    `dl-${Date.now()}-${Math.random().toString(16).slice(2)}.zip`,
  );
  await fs.writeFile(tempZip, buffer);
  try {
    try {
      await execFileAsync('unzip', ['-qo', tempZip, '-d', destination]);
    } catch (error) {
      try {
        await execFileAsync('ditto', ['-xk', tempZip, destination]);
      } catch {
        throw error;
      }
    }
  } finally {
    await fs.rm(tempZip, { force: true }).catch(() => undefined);
  }
};

const downloadToBuffer = async (name: string, rawUrl: string) => {
  const url = toDirectDropboxUrl(rawUrl.trim());
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching "${name}" from ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (isLikelyHtml(buffer)) {
    throw new Error(
      `Got HTML when fetching "${name}". Provide a direct file URL.`,
    );
  }
  return { buffer, url };
};

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function removeDir(dir: string) {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
}

async function readHashCache(pathname: string) {
  try {
    const raw = await fs.readFile(pathname, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore
  }
  return {} as Record<string, string>;
}

function parseArgs(argv: string[]) {
  const opts = {
    target: '_staging',
    versionOverride: null as string | null,
    help: false,
  };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'release') opts.target = t;
      else if (t === 's') opts.target = '_staging';
      else if (t === 'r') opts.target = 'release';
    } else if (arg.startsWith('--version=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) opts.versionOverride = v;
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      [
        'Usage: yarn generate:fonts [--target=_staging|release] [--version=vX]',
        '',
        'Builds merged fonts config and downloads self-hosted fonts into tmp.',
        'Outputs:',
        '  tmp/cdn/<target>/fonts/<version>/fonts.config.json',
        '  tmp/cdn/downloads/<target>/<version>/fonts/<family>.gen/...',
        '  tmp/cdn/<target>/fonts/<version>/<family>.gen/...',
      ].join('\n'),
    );
    return;
  }

  const googleRaw = await readJson<unknown>(GOOGLE_FONTS_PATH);
  const selfRaw = await readJson<unknown>(SELF_HOSTED_PATH);
  const google = ensureRecord(googleRaw, 'googleFonts.json');
  const selfHosted = ensureRecord(selfRaw, 'selfhostedFontsSources.json');

  const merged: FontsConfig = {};
  for (const [key, value] of Object.entries(google)) {
    merged[key] = {
      ...(value as GoogleEntry),
      type: 'googleFonts',
    };
  }

  for (const [key, value] of Object.entries(selfHosted)) {
    if (merged[key]) {
      throw new Error(
        `Duplicate font key "${key}" in googleFonts.json and selfhostedFontsSources.json.`,
      );
    }
    const entry = value as SelfHostedEntry;
    if (!entry?.src || typeof entry.src !== 'string') {
      throw new Error(`Self-hosted font "${key}" is missing a src string.`);
    }
    merged[key] = {
      ...entry,
      type: 'selfHosted',
    };
  }

  const versionsRaw = await fs.readFile(VERSIONS_PATH, 'utf8').catch(() => '{}');
  let parsedVersions: Record<string, Record<string, string>> = {};
  try {
    parsedVersions = JSON.parse(versionsRaw) as Record<
      string,
      Record<string, string>
    >;
  } catch {
    parsedVersions = {};
  }
  const version =
    opts.versionOverride ||
    parsedVersions?.[opts.target]?.[CATEGORY] ||
    'v1';

  const outRoot = path.join(TMP_ROOT, opts.target, CATEGORY, version);
  await fs.mkdir(outRoot, { recursive: true });
  const outputPath = path.join(outRoot, 'fonts.config.json');
  await writeJsonAtomic(outputPath, merged);
  console.log(`✓ Wrote fonts config → ${outputPath}`);

  const hasSelfHosted = Object.keys(selfHosted).length > 0;
  if (hasSelfHosted) {
    const downloadRoot = path.join(
      DOWNLOAD_ROOT,
      opts.target,
      version,
      'fonts',
    );
    await ensureDir(downloadRoot);
    const hashPath = path.join(downloadRoot, HASH_FILENAME);
    const hashCache = await readHashCache(hashPath);
    let hashChanged = false;

    console.log('→ Downloading self-hosted fonts into tmp/');
    for (const [fontKey, entry] of Object.entries(merged)) {
      if (entry.type !== 'selfHosted') continue;
      const keySlug = normalizeKey(fontKey);
      const outDir = path.join(downloadRoot, `${keySlug}.gen`);

      const rawUrl = entry.src?.trim() ?? '';
      if (!rawUrl) {
        throw new Error(`Self-hosted font "${fontKey}" is missing src.`);
      }
      const hash = sha256(`${rawUrl}::${version}`);
      const cached = hashCache[fontKey];
      const stagedDest = path.join(outRoot, `${keySlug}.gen`);
      if (cached === hash && (await fileExists(stagedDest))) {
        console.log(`ℹ︎ ${fontKey}: url+version unchanged; skipping download.`);
        continue;
      }
      await removeDir(outDir);
      await ensureDir(outDir);

      const listingUrl = normalizeDropboxListingUrl(rawUrl);
      const listingRes = await fetch(listingUrl, { redirect: 'follow' });
      if (!listingRes.ok) {
        throw new Error(
          `HTTP ${listingRes.status} for listing ${listingUrl}`,
        );
      }

      const contentType =
        listingRes.headers.get('content-type')?.toLowerCase() ?? '';
      const rawBuffer = Buffer.from(await listingRes.arrayBuffer());

      const downloads: { name: string; url: string }[] = [];

      if (contentType.includes('application/zip') || isLikelyZip(rawBuffer)) {
        await extractZipBuffer(rawBuffer, outDir);
      } else if (contentType.includes('text/html') || isLikelyHtml(rawBuffer)) {
        const html = rawBuffer.toString('utf8');
        const links = extractFileLinks(html, listingUrl);
        if (links.length === 0) {
          const zipUrl = toDropboxDownloadUrl(rawUrl);
          const zipRes = await fetch(zipUrl, { redirect: 'follow' });
          if (!zipRes.ok) {
            throw new Error(
              `HTTP ${zipRes.status} when downloading zip ${zipUrl}`,
            );
          }
          const zipBuffer = Buffer.from(await zipRes.arrayBuffer());
          if (!isLikelyZip(zipBuffer)) {
            throw new Error(
              `No font files found in listing ${listingUrl}`,
            );
          }
          await extractZipBuffer(zipBuffer, outDir);
        } else {
          for (const link of links) {
            const direct = toDirectDropboxUrl(link);
            const name =
              path.basename(new URL(link).pathname) ||
              `${keySlug}.woff2`;
            downloads.push({ name, url: direct });
          }
        }
      } else {
        const direct = toDirectDropboxUrl(rawUrl);
        const name =
          path.basename(new URL(direct).pathname) || `${keySlug}.woff2`;
        downloads.push({ name, url: direct });
      }

      for (const item of downloads) {
        const { buffer } = await downloadToBuffer(item.name, item.url);
        const tempFile = path.join(outDir, item.name);
        await fs.writeFile(tempFile, buffer);
      }

      const entries = await fs.readdir(outDir);
      const validFiles = entries.filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return DOWNLOADABLE_EXTENSIONS.has(ext);
      });
      if (validFiles.length === 0) {
        throw new Error(`No font files downloaded for "${fontKey}".`);
      }

      await removeDir(stagedDest);
      await copyDirFiltered(outDir, stagedDest, ALLOWED_EXTENSIONS);
      console.log(`✓ Staged ${fontKey} → ${stagedDest}`);
      hashCache[fontKey] = hash;
      hashChanged = true;
    }
    if (hashChanged) {
      await writeJsonAtomic(hashPath, hashCache);
      console.log(`✓ Wrote font hash cache → ${hashPath}`);
    }
    console.log(`✓ Staged self-hosted fonts → ${outRoot}`);
  } else {
    console.log('ℹ︎ No self-hosted fonts configured. Skipping download.');
  }
}

main().catch((error) => {
  console.error('❌ generateLocalFonts failed');
  console.error(error);
  process.exit(1);
});
