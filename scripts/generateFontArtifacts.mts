#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(__filename), '..');

const TMP_ROOT = path.join(REPO_ROOT, 'tmp', 'cdn');
const VERSIONS_PATH = path.join(REPO_ROOT, 'cdn', 'assetGroupVersions.json');

const CONFIG_OUT = (target: Target) =>
  path.join(
    REPO_ROOT,
    'src',
    'data',
    'generated',
    target,
    'fonts',
    'config.fonts.gen.json',
  );
const FONTFACES_TS_OUT = (target: Target) =>
  path.join(REPO_ROOT, 'src', 'styles', `fontFaces.${target}.css.ts`);
const FONTFACES_CSS_OUT = (target: Target) =>
  path.join(REPO_ROOT, 'public', 'styles', `fontFaces.${target}.gen.css`);

type Target = '_staging' | 'release';
type FontsConfig = Record<string, unknown>;

type FontManifestEntry = {
  type: 'selfHosted';
  src: string;
  weights?: number[];
  ital?: boolean;
  axes?: Record<string, string>;
  dirName: string;
  files: { fileName: string; url: string }[];
};

type FaceGroup = {
  fontFamily: string;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  srcParts: { format: string; url: string }[];
};

const FORMAT_BY_EXT: Record<string, string> = {
  '.woff2': 'woff2',
  '.woff': 'woff',
  '.otf': 'opentype',
  '.ttf': 'truetype',
  '.eot': 'embedded-opentype',
};
const FORMAT_ORDER = ['.woff2', '.woff', '.otf', '.ttf', '.eot'];

const PREFIX_BY_TARGET: Record<Target, string> = {
  release: 'release',
  _staging: '_staging',
};

const normalizeBaseUrl = (raw: string) => {
  const trimmed = raw.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

const color = {
  blue: (value: string) => `\x1b[34m${value}\x1b[0m`,
  yellow: (value: string) => `\x1b[33m${value}\x1b[0m`,
};

const formatTargetLabel = (target: Target) =>
  target === '_staging' ? color.blue(target) : color.yellow(target);

async function readJson<T>(pathname: string): Promise<T> {
  const raw = await fs.readFile(pathname, 'utf8');
  return JSON.parse(raw) as T;
}

async function writeFileAtomic(pathname: string, contents: string) {
  const dir = path.dirname(pathname);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${pathname}.tmp`;
  await fs.writeFile(tmpPath, contents, 'utf8');
  await fs.rename(tmpPath, pathname);
}

async function fileExists(pathname: string) {
  try {
    await fs.access(pathname);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv: string[]) {
  const opts = {
    target: '_staging' as Target,
    hasExplicitTarget: false,
    hasExplicitBoth: false,
    versionOverride: null as string | null,
    baseUrlOverride: null as string | null,
    skipSelfHosted: false,
    skipGoogleFonts: false,
    help: false,
  };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg.startsWith('--target=')) {
      const t = arg.split('=')[1]?.trim();
      if (t === '_staging' || t === 'release') {
        opts.target = t;
        opts.hasExplicitTarget = true;
      } else if (t === 's') {
        opts.target = '_staging';
        opts.hasExplicitTarget = true;
      } else if (t === 'r') {
        opts.target = 'release';
        opts.hasExplicitTarget = true;
      } else if (t === 'both' || t === 'b') {
        opts.hasExplicitTarget = true;
        opts.hasExplicitBoth = true;
      }
    } else if (arg.startsWith('--version=')) {
      const v = arg.split('=')[1]?.trim();
      if (v) opts.versionOverride = v;
    } else if (arg.startsWith('--base-url=')) {
      const url = arg.split('=')[1]?.trim();
      if (url) opts.baseUrlOverride = url;
    } else if (arg === '--skip-self-hosted') {
      opts.skipSelfHosted = true;
    } else if (arg === '--skip-google-fonts') {
      opts.skipGoogleFonts = true;
    }
  }
  return opts;
}

const runCdnScript = (script: string, args: string[]) => {
  const result = spawnSync(
    'yarn',
    [
      '--cwd',
      path.join(REPO_ROOT, 'cdn'),
      script,
      ...args,
    ],
    {
      stdio: 'inherit',
    },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

async function pickTargets(): Promise<Target[]> {
  const stagingPath = path.join(TMP_ROOT, '_staging');
  const releasePath = path.join(TMP_ROOT, 'release');
  const stagingExists = await fileExists(stagingPath);
  const releaseExists = await fileExists(releasePath);

  if (stagingExists && releaseExists) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      'Found manifests for both _staging and release. Use which? [_staging (s)/release (r)/both (b)] (default: both): ',
    );
    await rl.close();
    const t = answer.trim();
    if (t === 'release' || t === 'r') return ['release'];
    if (t === '_staging' || t === 's') return ['_staging'];
    if (t === 'both' || t === 'b' || t === '') return ['_staging', 'release'];
    return ['_staging', 'release'];
  }

  if (releaseExists) return ['release'];
  return ['_staging'];
}

async function resolveVersion(
  target: Target,
  override: string | null,
): Promise<string> {
  if (override) return override;
  const raw = await fs.readFile(VERSIONS_PATH, 'utf8').catch(() => '{}');
  try {
    const parsed = JSON.parse(raw) as Record<
      string,
      Record<string, string>
    >;
    const v = parsed?.[target]?.fonts;
    return typeof v === 'string' && v.trim() ? v.trim() : 'v1';
  } catch {
    return 'v1';
  }
}

function formatFamilyName(raw: string) {
  return raw.replace(/\+/g, ' ');
}

function inferStyle(fileName: string): 'normal' | 'italic' {
  return /italic/i.test(fileName) ? 'italic' : 'normal';
}

async function loadMetaData(
  dirPath: string,
): Promise<Record<string, number>> {
  const metaPath = path.join(dirPath, 'metaData.json');
  if (!(await fileExists(metaPath))) return {};
  try {
    const raw = await fs.readFile(metaPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

async function buildFontFaces(options: {
  baseUrl: string;
  target: Target;
  version: string;
  manifest: Record<string, FontManifestEntry>;
  versionRoot: string;
}): Promise<FaceGroup[]> {
  const { baseUrl, target, version, manifest, versionRoot } = options;
  const prefix = PREFIX_BY_TARGET[target];
  const groups = new Map<string, FaceGroup>();

  for (const [familyKey, entry] of Object.entries(manifest)) {
    if (entry.type !== 'selfHosted') continue;
    const familyName = formatFamilyName(familyKey);
    const dirPath = path.join(versionRoot, entry.dirName);
    const metaData = await loadMetaData(dirPath);
    for (const file of entry.files ?? []) {
      const ext = path.extname(file.fileName).toLowerCase();
      const format = FORMAT_BY_EXT[ext];
      if (!format) continue;
      const style = inferStyle(file.fileName);
      const weight =
        metaData[file.fileName] ??
        entry.weights?.[0] ??
        400;
      const key = `${familyName}::${weight}::${style}`;
      const urlPath = file.url;
      const url = /^https?:\/\//i.test(urlPath)
        ? urlPath
        : `${baseUrl}/${prefix}/fonts/${version}/${urlPath}`;
      const group =
        groups.get(key) ??
        ({
          fontFamily: familyName,
          fontWeight: weight,
          fontStyle: style,
          srcParts: [],
        } satisfies FaceGroup);
      group.srcParts.push({ format, url });
      groups.set(key, group);
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.fontFamily !== b.fontFamily) {
      return a.fontFamily.localeCompare(b.fontFamily);
    }
    if (a.fontWeight !== b.fontWeight) {
      return a.fontWeight - b.fontWeight;
    }
    return a.fontStyle.localeCompare(b.fontStyle);
  });
}

function sortSrcParts(srcParts: FaceGroup['srcParts']) {
  return srcParts.slice().sort((a, b) => {
    const aIdx = FORMAT_ORDER.indexOf(`.${a.format}`);
    const bIdx = FORMAT_ORDER.indexOf(`.${b.format}`);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
}

function renderCss(groups: FaceGroup[]) {
  const blocks = groups.map((group) => {
    const srcParts = sortSrcParts(group.srcParts)
      .map(
        (part) =>
          `url("${part.url}") format("${part.format}")`,
      )
      .join(', ');
    return [
      '@font-face {',
      `  font-family: "${group.fontFamily}";`,
      `  font-style: ${group.fontStyle};`,
      `  font-weight: ${group.fontWeight};`,
      '  font-display: swap;',
      `  src: ${srcParts};`,
      '}',
    ].join('\n');
  });
  const header =
    '/* AUTO-GENERATED by scripts/generateFontArtifacts.mts — DO NOT EDIT */';
  return `${header}\n${blocks.join('\n\n')}\n`;
}

function renderCssTs(groups: FaceGroup[]) {
  const lines = [
    "// AUTO-GENERATED by scripts/generateFontArtifacts.mts — DO NOT EDIT",
    "import { globalFontFace } from '@vanilla-extract/css';",
    '',
    'const fontFaces = [',
  ];

  for (const group of groups) {
    const srcParts = sortSrcParts(group.srcParts)
      .map(
        (part) =>
          `url("${part.url}") format("${part.format}")`,
      )
      .join(', ');
    lines.push('  {');
    lines.push(`    fontFamily: '${group.fontFamily}',`);
    lines.push(`    fontStyle: '${group.fontStyle}',`);
    lines.push(`    fontWeight: ${group.fontWeight},`);
    lines.push("    fontDisplay: 'swap',");
    lines.push(`    src: '${srcParts}',`);
    lines.push('  },');
  }

  lines.push('] as const;');
  lines.push('');
  lines.push('for (const face of fontFaces) {');
  lines.push('  const { fontFamily, ...fontFace } = face;');
  lines.push('  globalFontFace(fontFamily, fontFace);');
  lines.push('}');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      [
        'Usage: yarn generate:fontArtifacts [--target=_staging|release] [--version=vX] [--base-url=https://...] [--skip-self-hosted] [--skip-google-fonts]',
        '',
        'Defaults to running generate:selfHostedFonts before, and generate:googleFonts after.',
        '',
        'Reads tmp fonts config + manifest to produce:',
        '  src/data/generated/<target>/fonts/config.fonts.gen.json',
        '  src/styles/fontFaces.<target>.css.ts',
        '  public/styles/fontFaces.<target>.gen.css',
        '',
        'Examples:',
        '  yarn generate:fontArtifacts --target=_staging',
        '  yarn generate:fontArtifacts --target=release --version=v2',
        '  yarn generate:fontArtifacts --base-url=https://cdn.example.com',
      ].join('\n'),
    );
    return;
  }

  const targets: Target[] = opts.hasExplicitTarget
    ? opts.hasExplicitBoth
      ? (['_staging', 'release'] as Target[])
      : [opts.target]
    : await pickTargets();

  const forwardedArgs = process.argv
    .slice(2)
    .filter(
      (arg) =>
        arg !== '--target' &&
        !arg.startsWith('--target=') &&
        arg !== '--skip-self-hosted' &&
        arg !== '--skip-google-fonts',
    );

  if (!opts.skipSelfHosted) {
    for (const target of targets) {
      runCdnScript('generate:selfHostedFonts', [
        ...forwardedArgs,
        `--target=${target}`,
      ]);
    }
  }

  const baseUrlEnv =
    opts.baseUrlOverride ??
    process.env.CDN_PUBLIC_BASE_URL ??
    '';
  const baseUrl = baseUrlEnv.trim()
    ? normalizeBaseUrl(baseUrlEnv)
    : '';

  for (const target of targets) {
    const targetLabel = formatTargetLabel(target);
    const version = await resolveVersion(target, opts.versionOverride);
    const versionRoot = path.join(TMP_ROOT, target, 'fonts', version);
    const configPath = path.join(versionRoot, 'fonts.config.json');
    const manifestPath = path.join(versionRoot, 'manifest.json');
    const publicManifestPath = path.join(
      REPO_ROOT,
      'src',
      'data',
      'generated',
      target,
      'fonts',
      'manifest.fonts.gen.json',
    );

    if (!(await fileExists(configPath))) {
      throw new Error(`Missing fonts config at ${configPath}`);
    }

    const configOut = CONFIG_OUT(target);
    const fontFacesTsOut = FONTFACES_TS_OUT(target);
    const fontFacesCssOut = FONTFACES_CSS_OUT(target);

    const config = await readJson<FontsConfig>(configPath);
    await writeFileAtomic(
      configOut,
      `${JSON.stringify(config, null, 2)}\n`,
    );
    console.log(`[${targetLabel}] ✓ Wrote fonts config → ${configOut}`);

    const publicManifestExists = await fileExists(publicManifestPath);
    const tmpManifestExists = await fileExists(manifestPath);
    const manifest = publicManifestExists
      ? await readJson<Record<string, FontManifestEntry>>(publicManifestPath)
      : tmpManifestExists
        ? await readJson<Record<string, FontManifestEntry>>(manifestPath)
        : {};

    const hasSelfHosted = Object.keys(manifest).length > 0;
    const needsBaseUrl = Object.values(manifest).some((entry) =>
      (entry.files ?? []).some(
        (file) => !/^https?:\/\//i.test(file.url),
      ),
    );
    if (hasSelfHosted && needsBaseUrl && !baseUrl.trim()) {
      throw new Error(
        `Missing base URL for self-hosted fonts. Run cdn:sync --fonts to generate src/data/generated/${target}/fonts/manifest.fonts.gen.json, or set CDN_PUBLIC_BASE_URL, or use --base-url (ex: yarn generate:fontArtifacts --target=${target} --base-url=https://cdn.example.com).`,
      );
    }

    const fontFaces = hasSelfHosted
      ? await buildFontFaces({
          baseUrl,
          target,
          version,
          manifest,
          versionRoot,
        })
      : [];

    const css = renderCss(fontFaces);
    const ts = renderCssTs(fontFaces);

    await writeFileAtomic(fontFacesTsOut, ts);
    console.log(`[${targetLabel}] ✓ Wrote font faces → ${fontFacesTsOut}`);

    await writeFileAtomic(fontFacesCssOut, css);
    console.log(
      `[${targetLabel}] ✓ Wrote public font faces → ${fontFacesCssOut}`,
    );
  }

  if (!opts.skipGoogleFonts) {
    runCdnScript('generate:googleFonts', process.argv.slice(2));
  }
}

main().catch((error) => {
  console.error('❌ generateFontArtifacts failed');
  console.error(error);
  process.exit(1);
});
