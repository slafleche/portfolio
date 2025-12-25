import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOOGLE_FONT_URLS } from '../src/data/generated/fonts/googleFonts.gen';

type Target = '_staging' | 'release';
type FontConfigEntry = {
  type: 'googleFonts' | 'selfHosted';
  weights?: string | number[];
  ital?: boolean;
  axes?: Record<string, string | string[]>;
};
type FontConfig = Record<string, FontConfigEntry>;
type ManifestEntry = {
  type: 'selfHosted';
  dirName: string;
  files: Array<{ fileName: string; url: string }>;
};
type Manifest = Record<string, ManifestEntry>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const TARGETS: Target[] = [
  '_staging',
  'release',
];

function parseArgs(argv: string[]): { targets: Target[]; font?: string } {
  const targetArg = argv.find((arg) => arg.startsWith('--target='));
  const fontArg = argv.find((arg) => arg.startsWith('--font='));
  const font = fontArg?.split('=')[1]?.trim() || undefined;

  if (!targetArg) {
    return { targets: TARGETS, font };
  }
  const raw = targetArg.split('=')[1]?.trim();
  if (raw === '_staging' || raw === 'release') {
    return { targets: [raw], font };
  }
  if (raw === 's') {
    return { targets: ['_staging'], font };
  }
  if (raw === 'r') {
    return { targets: ['release'], font };
  }
  if (raw === 'both') {
    return { targets: TARGETS, font };
  }
  throw new Error(
    `Invalid --target value "${raw}". Use --target=_staging, --target=release, --target=s, --target=r, or omit for both.`,
  );
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

function getGoogleFontUrls(): string[] {
  return Array.from(new Set(GOOGLE_FONT_URLS));
}

function hasGoogleFontFamily(urls: string[], family: string): boolean {
  const normalized = family.replace(/\+/g, ' ').trim();
  const encoded = encodeURIComponent(normalized).replace(/%20/g, '+');
  const matchToken = `family=${encoded}`;
  return urls.some((url) => url.includes(matchToken));
}

type ValidationResult = {
  errors: string[];
  successes: string[];
};

async function validateTarget(
  target: Target,
  fontFilter?: string,
): Promise<ValidationResult> {
  const errors: string[] = [];
  const successes: string[] = [];
  const configPath = path.join(
    REPO_ROOT,
    'src',
    'data',
    'generated',
    target,
    'fonts',
    'config.fonts.gen.json',
  );
  const manifestPath = path.join(
    REPO_ROOT,
    'src',
    'data',
    'generated',
    target,
    'fonts',
    'manifest.fonts.gen.json',
  );

  let config: FontConfig;
  try {
    config = await readJson<FontConfig>(configPath);
  } catch (error) {
    errors.push(
      `[${target}] Missing or invalid config: ${configPath} (${String(error)})`,
    );
    return { errors, successes };
  }

  let manifest: Manifest | null = null;
  try {
    manifest = await readJson<Manifest>(manifestPath);
  } catch {
    manifest = null;
  }

  const googleUrls = getGoogleFontUrls();

  const entries = Object.entries(config).filter(([family]) => {
    if (!fontFilter) return true;
    return family === fontFilter;
  });

  if (fontFilter && entries.length === 0) {
    errors.push(
      `[${target}] Font "${fontFilter}" not found in config.`,
    );
    return { errors, successes };
  }

  for (const [family, entry] of entries) {
    let ok = true;
    if (entry.type === 'selfHosted') {
      if (!manifest) {
        errors.push(
          `[${target}] Missing manifest for self-hosted font "${family}". Expected ${manifestPath}`,
        );
        ok = false;
        continue;
      }
      const manifestEntry = manifest[family];
      if (!manifestEntry) {
        errors.push(
          `[${target}] Self-hosted font "${family}" missing from manifest.`,
        );
        ok = false;
        continue;
      }
      const files = manifestEntry.files ?? [];
      const hasWoff2 = files.some((file) =>
        file.fileName.toLowerCase().endsWith('.woff2'),
      );
      if (files.length === 0 || !hasWoff2) {
        errors.push(
          `[${target}] Self-hosted font "${family}" has no .woff2 files in manifest.`,
        );
        ok = false;
      }
    } else if (entry.type === 'googleFonts') {
      if (!hasGoogleFontFamily(googleUrls, family)) {
        errors.push(
          `[${target}] Google font "${family}" missing from googleFonts.gen.ts URLs.`,
        );
        ok = false;
      }
    } else {
      errors.push(
        `[${target}] Font "${family}" has unknown type "${entry.type}".`,
      );
      ok = false;
    }
    if (ok) {
      successes.push(`[${target}] ${family}`);
    }
  }

  return { errors, successes };
}

async function main() {
  const { targets, font } = parseArgs(process.argv.slice(2));
  const allErrors: string[] = [];
  const allSuccesses: string[] = [];

  for (const target of targets) {
    const { errors, successes } = await validateTarget(target, font);
    allErrors.push(...errors);
    allSuccesses.push(...successes);
  }

  if (allErrors.length > 0) {
    console.error('Font smoke test failed:');
    for (const line of allErrors) {
      console.error(`- ${line}`);
    }
    process.exit(1);
  }

  for (const line of allSuccesses) {
    console.log(`✓ ${line}`);
  }

  const fontLabel = font ? `, font=${font}` : '';
  console.log(
    `Font smoke test passed (${targets.join(', ')}${fontLabel}).`,
  );
}

main().catch((error) => {
  console.error(`Font smoke test crashed: ${String(error)}`);
  process.exit(1);
});
