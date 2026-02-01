import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AVAILABLE_LOCALES } from '@/data/locales';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import { isRelease } from '@/lib/runtimeEnv';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'public');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'sitemap.xml');
const LOCAL_ENV_PATH = path.join(REPO_ROOT, '.env.local');

const loadLocalEnv = async () => {
  try {
    const raw = await readFile(LOCAL_ENV_PATH, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const splitIndex = trimmed.indexOf('=');
      if (splitIndex <= 0) return;
      const key = trimmed.slice(0, splitIndex).trim();
      const value = trimmed.slice(splitIndex + 1).trim();
      if (!key || key in process.env) return;
      const unquoted =
        value.startsWith('"') && value.endsWith('"')
          ? value.slice(1, -1)
          : value.startsWith("'") && value.endsWith("'")
            ? value.slice(1, -1)
            : value;
      process.env[key] = unquoted;
    });
  } catch {
    // Ignore missing local env file.
  }
};

await loadLocalEnv();

const defaultOrigin = isRelease()
  ? 'https://lafleche.dev'
  : 'https://staging.lafleche.dev';
const siteUrlEnv = process.env.SITE_URL?.trim() ?? '';
const siteUrl = siteUrlEnv || defaultOrigin;

let origin: string;
try {
  origin = new URL(siteUrl).origin;
} catch (error) {
  console.error(
    `Invalid SITE_URL "${siteUrl}". Expected a full URL like https://lafleche.dev.`,
  );
  console.error(error);
  process.exit(1);
}

const publicRoutes = [
  '',
  'systems',
  'architecture',
] as const;

const urls: string[] = [];
for (const locale of AVAILABLE_LOCALES) {
  const localePrefix = `/${locale}`;
  urls.push(`${origin}${localePrefix}`);

  for (const route of publicRoutes) {
    if (!route) continue;
    const localized =
      canonicalToLocalizedSlugs[locale]?.[route] ?? route;
    urls.push(`${origin}${localePrefix}/${localized}`);
  }
}

const lastmod = new Date().toISOString();
const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (url) =>
      [
        '  <url>',
        `    <loc>${url}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '  </url>',
      ].join('\n'),
  ),
  '</urlset>',
  '',
];

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_PATH, `${xmlLines.join('\n')}\n`, 'utf8');

console.log(`✓ Wrote sitemap: ${OUTPUT_PATH}`);
