#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

type FontConfigEntry = {
  type?: string;
  src?: string;
};

type FontsConfig = Record<string, FontConfigEntry>;

const CONFIG_PATH = path.resolve('src', 'data', 'fonts.config.json');
const HASH_PATH = path.resolve(
  'src',
  'data',
  'generated',
  'selfHostedFonts.hash.json',
);
const TEMP_ROOT = path.resolve('tmp', 'fonts.selfHosted.gen');

const isLikelyHtml = (buffer: Buffer) => {
  const snippet = buffer.slice(0, 200).toString('utf8').toLowerCase();
  return (
    snippet.includes('<!doctype html') || snippet.includes('<html')
  );
};

const isLikelyZip = (buffer: Buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x50 &&
  buffer[1] === 0x4b &&
  buffer[2] === 0x03 &&
  buffer[3] === 0x04;

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');
const execFileAsync = promisify(execFile);

const normalizeKey = (key: string) => key.replace(/\s+/g, '-');

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

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

const downloadToBuffer = async (name: string, rawUrl: string) => {
  const url = toDirectDropboxUrl(rawUrl.trim());
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} while fetching "${name}" from ${url}`,
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (isLikelyHtml(buffer)) {
    throw new Error(
      `Got HTML when fetching "${name}". Provide a direct file URL.`,
    );
  }
  if (isLikelyZip(buffer)) {
    throw new Error(
      `Got what looks like a ZIP when fetching "${name}". Unzipping is not supported; use direct file URLs.`,
    );
  }
  return { buffer, url };
};

const extractFileLinks = (
  html: string,
  baseUrl: string,
): string[] => {
  const links = new Set<string>();
  const anchorRegex = /href="([^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html))) {
    const href = match[1];
    const isFont = /\.(woff2?|otf|ttf)(?:\?|$)/i.test(href);
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
    TEMP_ROOT,
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
    await fs.rm(tempZip, { force: true });
  }
};

const removeDir = async (dir: string) => {
  await fs
    .rm(dir, { recursive: true, force: true })
    .catch(() => undefined);
};

const writeHashCache = async (map: Record<string, string>) => {
  await ensureDir(path.dirname(HASH_PATH));
  await fs.writeFile(
    HASH_PATH,
    `${JSON.stringify(map, null, 2)}\n`,
    'utf8',
  );
};

const readHashCache = async () => {
  try {
    const raw = await fs.readFile(HASH_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore
  }
  return {} as Record<string, string>;
};

const hasFiles = async (dir: string) => {
  try {
    const entries = await fs.readdir(dir);
    return entries.length > 0;
  } catch {
    return false;
  }
};

async function main() {
  const rawConfig = await fs.readFile(CONFIG_PATH, 'utf8');
  const config = JSON.parse(rawConfig) as FontsConfig;

  const hashCache = await readHashCache();
  let cacheChanged = false;

  await ensureDir(TEMP_ROOT);

  for (const [
    fontKey,
    entry,
  ] of Object.entries(config)) {
    if (entry?.type !== 'selfHosted') continue;
    const keySlug = normalizeKey(fontKey);
    const outDir = path.join(TEMP_ROOT, `${keySlug}.gen`);
    const rawUrl = entry.src?.trim() ?? '';
    if (!rawUrl) {
      console.warn(`⚠️  Skipping "${fontKey}" — missing src URL`);
      continue;
    }

    const hash = sha256(rawUrl);
    const cached = hashCache[fontKey];

    if (cached === hash && (await hasFiles(outDir))) {
      console.log(
        `ℹ️  ${fontKey}: hash unchanged and outputs present. Skipping.`,
      );
      continue;
    }

    console.log(`→ Processing ${fontKey}`);
    await removeDir(outDir);
    await ensureDir(outDir);

    let copied = false;

    try {
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

      if (
        contentType.includes('application/zip') ||
        isLikelyZip(rawBuffer)
      ) {
        await extractZipBuffer(rawBuffer, outDir);
        copied = await hasFiles(outDir);
      } else if (
        contentType.includes('text/html') ||
        isLikelyHtml(rawBuffer)
      ) {
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
          const zipBuffer = Buffer.from(
            await zipRes.arrayBuffer(),
          );
          if (!isLikelyZip(zipBuffer)) {
            throw new Error(
              `No .woff/.woff2/.otf/.ttf links found in listing ${listingUrl}`,
            );
          }
          await extractZipBuffer(zipBuffer, outDir);
          copied = await hasFiles(outDir);
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
          path.basename(new URL(direct).pathname) ||
          `${keySlug}.woff2`;
        downloads.push({ name, url: direct });
      }

      for (const item of downloads) {
        const { buffer } = await downloadToBuffer(
          item.name,
          item.url,
        );
        const tempFile = path.join(outDir, item.name);
        await fs.writeFile(tempFile, buffer);
        copied = true;
      }

      if (!copied) {
        throw new Error(
          `No files copied for "${fontKey}".`,
        );
      }
    } catch (error) {
      throw error;
    }

    if (copied) {
      hashCache[fontKey] = hash;
      cacheChanged = true;
      console.log(`✅ Wrote ${outDir}`);
    }
  }

  if (cacheChanged) {
    await writeHashCache(hashCache);
    console.log(`✅ Updated hash cache at ${HASH_PATH}`);
  } else {
    console.log('ℹ️  No changes; hash cache unchanged.');
  }
}

main().catch((error) => {
  console.error('❌ generateSelfHostedFonts failed');
  console.error(error);
  process.exit(1);
});
