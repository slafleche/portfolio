#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import {
  faviconTokens,
  faviconAssetPlan,
  faviconThemeColors,
  faviconCacheTokens,
  faviconOptions,
  faviconAppConfig,
  faviconFormatManifest,
  type FaviconBackgroundVariant,
} from '../src/tokens/favicon.tokens';
import {
  writeHashedFile,
  type HashedWriteResult,
} from './lib/cacheBusting';
import {
  AVAILABLE_LOCALES,
  type Locale,
  type Messages,
} from '../src/lib/locales/translations/index';
import {
  DEFAULT_LOCALE,
  loadMessages,
} from '../src/lib/locales/locale';
import { createSectionTranslator } from '../src/lib/locales/sections/helpers.locale';
import {
  buildFaviconMetaBundle,
  type FaviconMetaBundle,
} from '../src/lib/locales/sections/favicons.locale';
import { isNotHosted, notRelease } from '../src/lib/runtimeEnv';

const OUT_ROOT = path.resolve('public', 'favicons');
const TEMP_ROOT = path.resolve('tmp', 'favicons.gen');
const MANIFEST_TS_PATH = path.resolve(
  'src',
  'data',
  'generated',
  'favicons.manifest.gen.ts',
);
const PUBLIC_ROOT = '/favicons';

type ExtractSvgLayerOptions = {
  attribute: string;
  purpose: string;
  require?: boolean;
  sanitizeFill?: string;
};

type ExtractSvgLayerResult = {
  svg: string;
  count: number;
};

const sanitizeFillFragment = (
  fragment: string,
  desiredFill: string,
) => {
  let sanitized = fragment.replace(
    /style="([^"]*)"/gi,
    (_match, styleContent: string) => {
      const declarations = styleContent
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => !part.toLowerCase().startsWith('fill:'));

      if (!declarations.length) {
        return '';
      }

      const rebuilt = declarations
        .map((part) => (part.endsWith(';') ? part : `${part};`))
        .join(' ');

      return `style="${rebuilt.trim()}"`;
    },
  );

  if (sanitized.includes('fill=')) {
    sanitized = sanitized.replace(
      /fill="[^"]*"/gi,
      `fill="${desiredFill}"`,
    );
  } else {
    const trimmed = sanitized.trimEnd();
    if (trimmed.endsWith('/>')) {
      sanitized = sanitized.replace(
        /\/>\s*$/u,
        ` fill="${desiredFill}" />`,
      );
    } else {
      sanitized = sanitized.replace(/>/u, ` fill="${desiredFill}">`);
    }
  }

  return sanitized;
};

const extractSvgLayer = (
  source: string,
  {
    attribute,
    purpose,
    require = false,
    sanitizeFill,
  }: ExtractSvgLayerOptions,
): ExtractSvgLayerResult | null => {
  const svgMatch = source.match(/<svg[^>]*>/i);
  if (!svgMatch) {
    throw new Error(
      `Favicons: unable to locate root <svg> element while preparing ${purpose}.`,
    );
  }

  const viewBoxMatch = svgMatch[0].match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100';

  const pattern = new RegExp(
    `<([\\w:.-]+)([^>]*${attribute}="true"[^>]*)(?:>([\\s\\S]*?)</\\1\\s*>|\\s*/>)`,
    'gi',
  );

  const attrStripPattern = new RegExp(
    `\\s*${attribute}="true"`,
    'gi',
  );
  const fragments: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const [
      ,
      tagName,
      attrText,
      inner = '',
    ] = match;
    const cleanedAttrs = attrText.replace(attrStripPattern, '');
    const opening = `<${tagName}${cleanedAttrs}`;
    const fragment =
      inner && inner.length
        ? `${opening}>${inner}</${tagName}>`
        : `${opening.trimEnd()} />`;
    const normalized = sanitizeFill
      ? sanitizeFillFragment(fragment, sanitizeFill)
      : fragment;
    fragments.push(normalized);
  }

  if (!fragments.length) {
    if (require) {
      throw new Error(
        [
          `Favicons: expected at least one element tagged with ${attribute}="true" for ${purpose}.`,
          'Update your source SVG to annotate the appropriate layer.',
        ].join(' '),
      );
    }
    return null;
  }

  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`,
    ...fragments,
    '</svg>',
    '',
  ].join('\n');

  return { svg, count: fragments.length };
};

type BackgroundVariant = FaviconBackgroundVariant;

const buildSvgBackgroundVariant = (
  source: string,
  background: BackgroundVariant,
) => {
  let kept = 0;
  let removed = 0;
  const pattern =
    /<([a-z0-9:._-]+)([^>]*\sdata-bg="(square|circular)"[^>]*)(?:>([\s\S]*?)<\/\1\s*>|\s*\/>)/gi;

  const stripped = source.replace(
    pattern,
    (
      fullMatch,
      _tagName: string,
      _attrs: string,
      attrValue: BackgroundVariant,
    ) => {
      if (attrValue !== background) {
        removed += 1;
        return '';
      }
      kept += 1;
      return fullMatch.replace(
        /\s*data-bg="(?:square|circular)"/i,
        '',
      );
    },
  );

  if (!kept) {
    throw new Error(
      `Favicons: missing data-bg="${background}" layer in source SVG.`,
    );
  }

  return {
    svg: stripped,
    kept,
    removed,
  };
};

type PngResult = HashedWriteResult & {
  size: number;
};

type IcoCandidate = {
  size: number;
  buffer: Buffer;
};

type ManifestLocaleEntry = {
  locale: Locale;
  name: string;
  shortName: string;
  description: string;
  categories: readonly string[];
};

type LocaleManifestLoadResult = {
  manifestEntries: Readonly<Record<Locale, ManifestLocaleEntry>>;
  faviconMetaBundles: Readonly<Record<Locale, FaviconMetaBundle>>;
};

const MANIFEST_NAME_KEY = 'manifest-name';
const MANIFEST_SHORT_NAME_KEY = 'manifest-short-name';
const MANIFEST_DESCRIPTION_KEY = 'manifest-description';
const MANIFEST_CATEGORIES_KEY = 'manifest-categories';

const ensureString = (
  value: unknown,
  key: string,
  locale: Locale,
): string => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  throw new Error(
    `Locale "${locale}" is missing a valid "${key}" string for favicons manifest.`,
  );
};

const ensureStringArray = (
  value: unknown,
  key: string,
  locale: Locale,
): readonly string[] => {
  if (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string')
  ) {
    return value;
  }
  throw new Error(
    `Locale "${locale}" is missing a valid "${key}" string array for favicons manifest.`,
  );
};

async function loadManifestLocaleEntries(): Promise<LocaleManifestLoadResult> {
  const manifestEntries: Record<Locale, ManifestLocaleEntry> =
    {} as Record<Locale, ManifestLocaleEntry>;
  const faviconMetaBundles: Record<Locale, FaviconMetaBundle> =
    {} as Record<Locale, FaviconMetaBundle>;
  const defaultMessages = await loadMessages(DEFAULT_LOCALE);

  for (const locale of AVAILABLE_LOCALES) {
    const messages: Messages =
      locale === DEFAULT_LOCALE
        ? defaultMessages
        : await loadMessages(locale);

    const name = ensureString(
      messages[MANIFEST_NAME_KEY],
      MANIFEST_NAME_KEY,
      locale,
    );
    const shortName = ensureString(
      messages[MANIFEST_SHORT_NAME_KEY],
      MANIFEST_SHORT_NAME_KEY,
      locale,
    );
    const description = ensureString(
      messages[MANIFEST_DESCRIPTION_KEY],
      MANIFEST_DESCRIPTION_KEY,
      locale,
    );
    const categories = ensureStringArray(
      messages[MANIFEST_CATEGORIES_KEY],
      MANIFEST_CATEGORIES_KEY,
      locale,
    );

    manifestEntries[locale] = {
      locale,
      name,
      shortName,
      description,
      categories,
    };

    const translator = createSectionTranslator(
      messages,
      defaultMessages,
    );
    faviconMetaBundles[locale] = buildFaviconMetaBundle(translator);
  }

  return { manifestEntries, faviconMetaBundles };
}

async function resetDir(dir: string) {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(dir, { recursive: true });
}

async function stageTempFile(
  name: string,
  ext: string,
  buffer: Buffer,
): Promise<string> {
  const fileName = `${name}${ext.startsWith('.') ? ext : `.${ext}`}`;
  const outPath = path.join(TEMP_ROOT, fileName);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buffer);
  return outPath;
}

function buildIcoFromPng(candidates: IcoCandidate[]) {
  if (!candidates.length) {
    throw new Error(
      'ICO generation requires at least one PNG candidate.',
    );
  }

  const sorted = [
    ...candidates,
  ].sort((a, b) => a.size - b.size);
  const count = sorted.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type (icon)
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = header.length + entries.length;

  sorted.forEach(({ size, buffer }, index) => {
    const entryOffset = index * 16;
    const dims = size >= 256 ? 0 : size;
    entries[entryOffset] = dims; // width
    entries[entryOffset + 1] = dims; // height
    entries[entryOffset + 2] = 0; // palette
    entries[entryOffset + 3] = 0; // reserved
    entries.writeUInt16LE(1, entryOffset + 4); // planes
    entries.writeUInt16LE(32, entryOffset + 6); // bit count
    entries.writeUInt32LE(buffer.length, entryOffset + 8);
    entries.writeUInt32LE(offset, entryOffset + 12);
    offset += buffer.length;
  });

  return Buffer.concat([
    header,
    entries,
    ...sorted.map((item) => item.buffer),
  ]);
}

async function main() {
  console.log('→ Favicons: cleaning staging directories');
  await resetDir(TEMP_ROOT);
  await resetDir(OUT_ROOT);

  const sourceSvgPath = path.resolve(faviconTokens.sourceSvg);
  console.log(`→ Favicons: loading source SVG "${sourceSvgPath}"`);

  const svgSource = await fs.readFile(sourceSvgPath, 'utf8');

  const maskLayer = extractSvgLayer(svgSource, {
    attribute: 'data-mask',
    purpose: 'the Safari mask icon',
    require: true,
    sanitizeFill: '#000',
  });

  const tileForegroundLayer = extractSvgLayer(svgSource, {
    attribute: 'data-tile-fg',
    purpose: 'the Windows tile foreground',
    require: true,
    sanitizeFill: '#fff',
  });

  const maskIconSvg = maskLayer?.svg ?? '';
  if (!maskIconSvg) {
    throw new Error(
      'Favicons: failed to generate Safari mask icon markup.',
    );
  }

  const tileForegroundSvg = tileForegroundLayer?.svg ?? null;
  const formatManifest = faviconFormatManifest;

  const circularBackground = buildSvgBackgroundVariant(
    svgSource,
    'circular',
  );
  const circularSvgBuffer = Buffer.from(
    circularBackground.svg,
    'utf8',
  );

  const squareBackground = buildSvgBackgroundVariant(
    svgSource,
    'square',
  );
  const squareSvgBuffer = Buffer.from(squareBackground.svg, 'utf8');

  const backgroundBufferFor = (variant: BackgroundVariant) =>
    variant === 'circular' ? circularSvgBuffer : squareSvgBuffer;

  let generatedMaskSvgPath = '';
  let generatedTileSvgPath = '';

  if (notRelease()) {
    const filesToFormat: string[] = [];

    generatedMaskSvgPath = path.join(
      OUT_ROOT,
      'favicons-mask-icon.gen.svg',
    );
    await fs.writeFile(generatedMaskSvgPath, maskIconSvg, 'utf8');
    filesToFormat.push(generatedMaskSvgPath);

    if (tileForegroundSvg) {
      generatedTileSvgPath = path.join(
        OUT_ROOT,
        'favicons-mstile-foreground.gen.svg',
      );
      await fs.writeFile(
        generatedTileSvgPath,
        tileForegroundSvg,
        'utf8',
      );
      filesToFormat.push(generatedTileSvgPath);
    }

    if (filesToFormat.length) {
      const formatResult = spawnSync(
        'yarn',
        [
          'format:svg',
        ],
        {
          stdio: 'inherit',
          cwd: process.cwd(),
        },
      );
      if (formatResult.status !== 0) {
        throw new Error(
          'Favicons: prettier format failed while normalizing extracted SVG layers.',
        );
      }
    }
  }

  const pngResults: PngResult[] = [];
  const icoCandidates: IcoCandidate[] = [];

  console.log('→ Favicons: generating PNG variants');
  const generalBackgroundBuffer = backgroundBufferFor(
    formatManifest.generalPng.meta.background,
  );
  if (
    formatManifest.faviconIco.meta.background !==
    formatManifest.generalPng.meta.background
  ) {
    throw new Error(
      'Favicons: faviconIco.meta.background must match generalPng.meta.background.',
    );
  }
  for (const size of faviconAssetPlan.pngSizes) {
    const logicalName = `icon-${size}`;
    const pngBuffer = await sharp(generalBackgroundBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({
        compressionLevel: 9,
        progressive: false,
      })
      .toBuffer();

    await stageTempFile(logicalName, '.png', pngBuffer);
    const hashed = await writeHashedFile({
      outDir: OUT_ROOT,
      logicalName,
      ext: '.png',
      buffer: pngBuffer,
      hashLength: faviconCacheTokens.hashLength,
      prefix: faviconCacheTokens.prefix,
      publicRoot: PUBLIC_ROOT,
    });

    pngResults.push({ ...hashed, size });

    if (faviconAssetPlan.icoSizes.includes(size)) {
      icoCandidates.push({ size, buffer: pngBuffer });
    }
  }

  if (!icoCandidates.length) {
    throw new Error(
      'No ICO candidates generated. Check faviconAssetPlan.icoSizes.',
    );
  }

  console.log('→ Favicons: writing favicon.svg');
  const svgBackgroundBuffer = backgroundBufferFor(
    formatManifest.faviconSvg.meta.background,
  );
  const svgResult = await writeHashedFile({
    outDir: OUT_ROOT,
    logicalName: faviconAssetPlan.svgOutputName.replace(
      /\.svg$/i,
      '',
    ),
    ext: '.svg',
    buffer: svgBackgroundBuffer,
    hashLength: faviconCacheTokens.hashLength,
    prefix: faviconCacheTokens.prefix,
    publicRoot: PUBLIC_ROOT,
  });

  console.log('→ Favicons: generating favicon.ico');
  const icoBuffer = buildIcoFromPng(icoCandidates);

  const icoResult = await writeHashedFile({
    outDir: OUT_ROOT,
    logicalName: 'favicon',
    ext: '.ico',
    buffer: icoBuffer,
    hashLength: faviconCacheTokens.hashLength,
    prefix: faviconCacheTokens.prefix,
    publicRoot: PUBLIC_ROOT,
  });

  console.log('→ Favicons: generating apple-touch-icon.png');
  const appleBackgroundBuffer = backgroundBufferFor(
    formatManifest.appleTouch.meta.background,
  );
  const appleBuffer = await sharp(appleBackgroundBuffer)
    .resize(
      faviconAssetPlan.appleTouchSize,
      faviconAssetPlan.appleTouchSize,
      {
        fit: 'contain',
        background: faviconThemeColors.background,
      },
    )
    .flatten({ background: faviconThemeColors.background })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await stageTempFile('apple-touch-icon', '.png', appleBuffer);
  const appleResult = await writeHashedFile({
    outDir: OUT_ROOT,
    logicalName: 'apple-touch-icon',
    ext: '.png',
    buffer: appleBuffer,
    hashLength: faviconCacheTokens.hashLength,
    prefix: faviconCacheTokens.prefix,
    publicRoot: PUBLIC_ROOT,
  });

  let maskableResult: HashedWriteResult | null = null;
  if (faviconOptions.generateMaskable) {
    console.log('→ Favicons: generating maskable icon');
    const maskableBackgroundBuffer = backgroundBufferFor(
      formatManifest.maskable.meta.background,
    );
    const maskableBuffer = await sharp(maskableBackgroundBuffer)
      .resize(
        faviconAssetPlan.maskableSize,
        faviconAssetPlan.maskableSize,
        {
          fit: 'contain',
          background: faviconThemeColors.background,
        },
      )
      .flatten({ background: faviconThemeColors.background })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await stageTempFile('maskable-icon', '.png', maskableBuffer);
    maskableResult = await writeHashedFile({
      outDir: OUT_ROOT,
      logicalName: 'maskable-icon',
      ext: '.png',
      buffer: maskableBuffer,
      hashLength: faviconCacheTokens.hashLength,
      prefix: faviconCacheTokens.prefix,
      publicRoot: PUBLIC_ROOT,
    });
  }

  console.log('→ Favicons: generating Safari mask-icon.svg');
  const maskIconResult = await writeHashedFile({
    outDir: OUT_ROOT,
    logicalName: 'mask-icon',
    ext: '.svg',
    buffer: maskIconSvg,
    hashLength: faviconCacheTokens.hashLength,
    prefix: faviconCacheTokens.prefix,
    publicRoot: PUBLIC_ROOT,
  });

  console.log('→ Favicons: generating mstile asset');
  const tileSize = faviconAssetPlan.browserConfigTileSize;
  const tileBackgroundBuffer = backgroundBufferFor(
    formatManifest.tile.meta.background,
  );
  const tileBuffer = await sharp(tileBackgroundBuffer)
    .resize(tileSize, tileSize, {
      fit: 'contain',
      background: faviconThemeColors.background,
    })
    .flatten({ background: faviconThemeColors.background })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await stageTempFile(`mstile-${tileSize}`, '.png', tileBuffer);
  const tileResult = await writeHashedFile({
    outDir: OUT_ROOT,
    logicalName: `mstile-${tileSize}`,
    ext: '.png',
    buffer: tileBuffer,
    hashLength: faviconCacheTokens.hashLength,
    prefix: faviconCacheTokens.prefix,
    publicRoot: PUBLIC_ROOT,
  });

  let browserConfigResult: HashedWriteResult | null = null;
  if (faviconOptions.generateBrowserConfig) {
    console.log('→ Favicons: generating browserconfig.xml');
    const browserConfigXml = [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<browserconfig>',
      '  <msapplication>',
      '    <tile>',
      `      <square150x150logo src="${tileResult.urlPath}"/>`,
      `      <TileColor>${faviconThemeColors.msTile}</TileColor>`,
      '    </tile>',
      '  </msapplication>',
      '</browserconfig>',
      '',
    ].join('\n');

    browserConfigResult = await writeHashedFile({
      outDir: OUT_ROOT,
      logicalName: 'browserconfig',
      ext: '.xml',
      buffer: browserConfigXml,
      hashLength: faviconCacheTokens.hashLength,
      prefix: faviconCacheTokens.prefix,
      publicRoot: PUBLIC_ROOT,
    });
  }

  console.log('→ Favicons: generating Android Chrome icon variants');
  const androidResults: PngResult[] = [];
  const androidBackgroundBuffer = backgroundBufferFor(
    formatManifest.android.meta.background,
  );
  for (const size of faviconAssetPlan.androidChromeSizes) {
    const logicalName = `icon-android-${size}`;
    const pngBuffer = await sharp(androidBackgroundBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({
        compressionLevel: 9,
        progressive: false,
      })
      .toBuffer();

    await stageTempFile(logicalName, '.png', pngBuffer);
    const hashed = await writeHashedFile({
      outDir: OUT_ROOT,
      logicalName,
      ext: '.png',
      buffer: pngBuffer,
      hashLength: faviconCacheTokens.hashLength,
      prefix: faviconCacheTokens.prefix,
      publicRoot: PUBLIC_ROOT,
    });

    androidResults.push({ ...hashed, size });
  }

  console.log('→ Favicons: compiling web manifests');
  const manifestIcons = new Map<number, HashedWriteResult>();
  for (const size of faviconAssetPlan.androidChromeSizes) {
    const match = androidResults.find((item) => item.size === size);
    if (!match) {
      throw new Error(
        `Missing Android-specific PNG variant for size ${size}.`,
      );
    }
    manifestIcons.set(size, match);
  }

  const {
    manifestEntries: manifestLocaleEntries,
    faviconMetaBundles,
  } = await loadManifestLocaleEntries();
  const webManifestResults: Record<Locale, HashedWriteResult> =
    {} as Record<Locale, HashedWriteResult>;
  let defaultWebManifestResult: HashedWriteResult | null = null;

  for (const locale of AVAILABLE_LOCALES) {
    const localeEntry = manifestLocaleEntries[locale];
    const manifestPayload: Record<string, unknown> = {
      name: localeEntry.name,
      short_name: localeEntry.shortName,
      description: localeEntry.description,
      start_url: faviconAppConfig.startUrl,
      scope: faviconAppConfig.scope,
      display: faviconAppConfig.display,
      orientation: faviconAppConfig.orientation,
      lang: locale,
      background_color: faviconThemeColors.background,
      theme_color: faviconThemeColors.dark,
      categories: localeEntry.categories,
      icons: [
        ...Array.from(manifestIcons.entries()).map(
          ([
            size,
            info,
          ]) => ({
            src: info.urlPath,
            type: 'image/png',
            sizes: `${size}x${size}`,
            purpose: 'any',
          }),
        ),
        ...(maskableResult
          ? [
              {
                src: maskableResult.urlPath,
                type: 'image/png',
                sizes: `${faviconAssetPlan.maskableSize}x${faviconAssetPlan.maskableSize}`,
                purpose: 'any maskable',
              },
            ]
          : []),
      ],
    };

    const buffer = Buffer.from(
      `${JSON.stringify(manifestPayload, null, 2)}\n`,
    );
    const hashed = await writeHashedFile({
      outDir: OUT_ROOT,
      logicalName: `site-${locale}`,
      ext: '.webmanifest',
      buffer,
      hashLength: faviconCacheTokens.hashLength,
      prefix: faviconCacheTokens.prefix,
      publicRoot: PUBLIC_ROOT,
    });
    webManifestResults[locale] = hashed;

    if (locale === DEFAULT_LOCALE) {
      defaultWebManifestResult = await writeHashedFile({
        outDir: OUT_ROOT,
        logicalName: 'site',
        ext: '.webmanifest',
        buffer,
        hashLength: faviconCacheTokens.hashLength,
        prefix: faviconCacheTokens.prefix,
        publicRoot: PUBLIC_ROOT,
      });
    }
  }

  if (!defaultWebManifestResult) {
    throw new Error(
      `Default locale "${DEFAULT_LOCALE}" did not produce a web manifest.`,
    );
  }

  console.log('→ Favicons: emitting generated manifest file');

  const toPublicPath = (absPath: string) =>
    `/${path.relative(path.resolve('public'), absPath).replace(/\\+/g, '/')}`;

  const devMaskSvgPublicPath =
    isNotHosted() && generatedMaskSvgPath
      ? toPublicPath(generatedMaskSvgPath)
      : null;
  const devTileSvgPublicPath =
    isNotHosted() && generatedTileSvgPath
      ? toPublicPath(generatedTileSvgPath)
      : null;

  const pngManifestEntries = pngResults
    .sort((a, b) => a.size - b.size)
    .map((item) => ({
      size: item.size,
      src: item.urlPath,
      fileName: item.fileName,
      hash: item.hash,
    }));

  const androidManifestEntries =
    faviconAssetPlan.androidChromeSizes.map((size) => {
      const item = androidResults.find(
        (entry) => entry.size === size,
      );
      if (!item) {
        throw new Error(
          `Android Chrome icon size ${size} missing from Android-specific outputs.`,
        );
      }
      return {
        size,
        src: item.urlPath,
        fileName: item.fileName,
        hash: item.hash,
      };
    });

  const androidIcons = androidManifestEntries.map((entry) => ({
    ...entry,
    sizes: `${entry.size}x${entry.size}`,
  }));

  const metaTags = {
    themeColorLight: faviconThemeColors.light,
    themeColorDark: faviconThemeColors.dark,
    msTileColor: faviconThemeColors.msTile,
    msApplicationConfig: browserConfigResult?.urlPath ?? null,
  };

  const manifestMetaByLocale = Object.fromEntries(
    AVAILABLE_LOCALES.map((locale) => [
      locale,
      {
        name: manifestLocaleEntries[locale].name,
        shortName: manifestLocaleEntries[locale].shortName,
        description: manifestLocaleEntries[locale].description,
        categories: manifestLocaleEntries[locale].categories,
        lang: locale,
      },
    ]),
  );

  const faviconMetaByLocale = Object.fromEntries(
    AVAILABLE_LOCALES.map((locale) => [
      locale,
      faviconMetaBundles[locale],
    ]),
  );

  const webManifestExportMap = Object.fromEntries(
    AVAILABLE_LOCALES.map((locale) => [
      locale,
      {
        src: webManifestResults[locale].urlPath,
        fileName: webManifestResults[locale].fileName,
        hash: webManifestResults[locale].hash,
      },
    ]),
  );

  const linkDescriptorsByLocale = Object.fromEntries(
    AVAILABLE_LOCALES.map((locale) => [
      locale,
      {
        main: [
          {
            rel: 'icon' as const,
            type: 'image/svg+xml',
            sizes: 'any',
            href: svgResult.urlPath,
          },
          ...pngManifestEntries.map((item) => ({
            rel: 'icon' as const,
            type: 'image/png',
            sizes: `${item.size}x${item.size}`,
            href: item.src,
          })),
          {
            rel: 'apple-touch-icon' as const,
            sizes: `${faviconAssetPlan.appleTouchSize}x${faviconAssetPlan.appleTouchSize}`,
            href: appleResult.urlPath,
          },
          {
            rel: 'mask-icon' as const,
            color: faviconThemeColors.maskIcon,
            href: maskIconResult.urlPath,
          },
          {
            rel: 'manifest' as const,
            href: webManifestResults[locale].urlPath,
          },
        ],
      },
    ]),
  );

  const appConfig = {
    startUrl: faviconAppConfig.startUrl,
    scope: faviconAppConfig.scope,
    display: faviconAppConfig.display,
    orientation: faviconAppConfig.orientation,
  };

  const faviconSvg = {
    src: svgResult.urlPath,
    fileName: svgResult.fileName,
    hash: svgResult.hash,
  };

  const faviconIco = {
    src: icoResult.urlPath,
    fileName: icoResult.fileName,
    hash: icoResult.hash,
  };

  const faviconAppleTouch = {
    src: appleResult.urlPath,
    fileName: appleResult.fileName,
    hash: appleResult.hash,
    size: faviconAssetPlan.appleTouchSize,
  };

  const faviconMaskIcon = {
    src: maskIconResult.urlPath,
    fileName: maskIconResult.fileName,
    hash: maskIconResult.hash,
    color: faviconThemeColors.maskIcon,
  };

  const faviconMsTile = {
    src: tileResult.urlPath,
    fileName: tileResult.fileName,
    hash: tileResult.hash,
    size: faviconAssetPlan.browserConfigTileSize,
    color: faviconThemeColors.msTile,
  };

  const manifestTs = `// AUTO-GENERATED by scripts/generateFavicons.ts — DO NOT EDIT
export const FAVICON_SVG = ${JSON.stringify(faviconSvg, null, 2)} as const;

export const FAVICON_ICO = ${JSON.stringify(faviconIco, null, 2)} as const;

export const FAVICON_PNG_VARIANTS = ${JSON.stringify(
    pngManifestEntries,
    null,
    2,
  )} as const;

export const FAVICON_APPLE_TOUCH_ICON = ${JSON.stringify(
    faviconAppleTouch,
    null,
    2,
  )} as const;

export const FAVICON_ANDROID_ICONS = ${JSON.stringify(
    androidIcons,
    null,
    2,
  )} as const;

export const FAVICON_MASK_ICON = ${JSON.stringify(
    faviconMaskIcon,
    null,
    2,
  )} as const;

export const FAVICON_MASKABLE_ICON = ${JSON.stringify(
    maskableResult
      ? {
          src: maskableResult.urlPath,
          fileName: maskableResult.fileName,
          hash: maskableResult.hash,
          size: faviconAssetPlan.maskableSize,
        }
      : null,
    null,
    2,
  )} as const;

export const FAVICON_MS_TILE = ${JSON.stringify(
    faviconMsTile,
    null,
    2,
  )} as const;

export const FAVICON_BROWSERCONFIG = ${JSON.stringify(
    browserConfigResult
      ? {
          src: browserConfigResult.urlPath,
          fileName: browserConfigResult.fileName,
          hash: browserConfigResult.hash,
        }
      : null,
    null,
    2,
  )} as const;

export const FAVICON_DEV_MASK_SVG_PATH = ${JSON.stringify(
    devMaskSvgPublicPath,
    null,
    2,
  )};

export const FAVICON_DEV_TILE_FOREGROUND_SVG_PATH = ${JSON.stringify(
    devTileSvgPublicPath,
    null,
    2,
  )};

export const FAVICON_MANIFEST_META_BY_LOCALE = ${JSON.stringify(
    manifestMetaByLocale,
    null,
    2,
  )} as const;

export const FAVICON_META_BUNDLES_BY_LOCALE = ${JSON.stringify(
    faviconMetaByLocale,
    null,
    2,
  )} as const;

export const FAVICON_WEB_MANIFESTS = ${JSON.stringify(
    webManifestExportMap,
    null,
    2,
  )} as const;

export const FAVICON_DEFAULT_WEB_MANIFEST = ${JSON.stringify(
    {
      locale: DEFAULT_LOCALE,
      src: defaultWebManifestResult.urlPath,
      fileName: defaultWebManifestResult.fileName,
      hash: defaultWebManifestResult.hash,
    },
    null,
    2,
  )} as const;

export const FAVICON_APP_CONFIG = ${JSON.stringify(appConfig, null, 2)} as const;

export const FAVICON_THEME_COLORS = ${JSON.stringify(
    {
      light: faviconThemeColors.light,
      dark: faviconThemeColors.dark,
      background: faviconThemeColors.background,
      maskIcon: faviconThemeColors.maskIcon,
      msTile: faviconThemeColors.msTile,
    },
    null,
    2,
  )} as const;

export const FAVICON_META_TAGS = ${JSON.stringify(
    metaTags,
    null,
    2,
  )} as const;

export const FAVICON_LINK_DESCRIPTORS_BY_LOCALE = ${JSON.stringify(
    linkDescriptorsByLocale,
    null,
    2,
  )} as const;
`;

  await fs.mkdir(path.dirname(MANIFEST_TS_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_TS_PATH, manifestTs, 'utf8');

  console.log(`→ Favicons: wrote manifest ${MANIFEST_TS_PATH}`);
  console.log(`→ Favicons: assets available under ${OUT_ROOT}`);

  console.log('→ Favicons: cleaning staging directory');
  await fs
    .rm(TEMP_ROOT, { recursive: true, force: true })
    .catch(() => {});
}

main().catch((error) => {
  console.error('✗ Favicons: generation failed');
  console.error(error);
  process.exit(1);
});
