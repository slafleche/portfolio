import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';
import { execa } from 'execa';

import { AVAILABLE_LOCALES } from '../src/data/locales';

const SHADOW_META_SUFFIX = '.shadow.json';
const SHADOW_COMMENT_TAG = 'heroHeadingSvgShadow';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const stripPaintAttrs = (input: string) =>
  input
    .replace(/\s+fill="[^"]*"/gi, '')
    .replace(/\s+stroke="[^"]*"/gi, '')
    .replace(/\s+fill-opacity="[^"]*"/gi, '')
    .replace(/\s+stroke-opacity="[^"]*"/gi, '')
    .replace(/\s+style="[^"]*"/gi, '');

const readShadowMetadata = async (svgPath: string) => {
  const metaPath = svgPath.replace(
    /\.svg$/i,
    SHADOW_META_SUFFIX,
  );
  try {
    const raw = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(raw) as {
      locale?: string;
      page?: string;
      name?: string;
      shadow?: {
        x?: number;
        y?: number;
        color?: string;
        opacity?: number;
        blur?: number;
      };
    };
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }
    throw error;
  }
};

const applyShadowToSvg = async (svgPath: string) => {
  const metadata = await readShadowMetadata(svgPath);
  if (!metadata?.shadow) return;

  const shadow = metadata.shadow;
  const dx = Number(shadow.x ?? 0);
  const dy = Number(shadow.y ?? 0);
  const blur = Number(shadow.blur ?? 0);
  const opacity = clamp(Number(shadow.opacity ?? 1), 0, 1);
  const color =
    typeof shadow.color === 'string'
      ? shadow.color
      : 'currentColor';

  let svg = await fs.readFile(svgPath, 'utf8');
  const commentPattern = new RegExp(
    `<!--\\s*${SHADOW_COMMENT_TAG}:[\\s\\S]*?-->\\s*`,
    'i',
  );
  svg = svg.replace(commentPattern, '');
  svg = svg.replace(
    /<defs[^>]*data-shadow="true"[^>]*>[\s\S]*?<\/defs>\s*/i,
    '',
  );
  svg = svg.replace(
    /<g[^>]*data-shadow="true"[^>]*>[\s\S]*?<\/g>\s*/i,
    '',
  );

  const pathMatches = [
    ...svg.matchAll(/<path\b[^>]*\/>/gi),
    ...svg.matchAll(/<path\b[^>]*>[\s\S]*?<\/path>/gi),
  ];
  const pathElements = pathMatches.map((match) => match[0]);
  if (pathElements.length === 0) return;

  const shadowPaths = pathElements
    .map(stripPaintAttrs)
    .join('\n  ');
  const filterId =
    blur > 0 ? 'hero-heading-shadow' : null;
  const filterAttr = filterId
    ? ` filter="url(#${filterId})"`
    : '';
  const defs =
    blur > 0
      ? `<defs data-shadow="true">\n    <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">\n      <feGaussianBlur stdDeviation="${blur}"/>\n    </filter>\n  </defs>`
      : '';
  const comment = `<!-- ${SHADOW_COMMENT_TAG}: ${JSON.stringify(
    metadata,
  )} -->`;
  const shadowGroup = `<g data-shadow="true"${filterAttr} transform="translate(${dx} ${dy})" fill="${color}" fill-opacity="${opacity}">\n  ${shadowPaths}\n</g>`;

  const svgOpenTag = svg.match(/<svg\b[^>]*>/i);
  if (!svgOpenTag) return;
  const injection = [comment, defs, shadowGroup]
    .filter(Boolean)
    .join('\n  ');
  svg = svg.replace(
    svgOpenTag[0],
    `${svgOpenTag[0]}\n  ${injection}`,
  );

  await fs.writeFile(svgPath, svg, 'utf8');
};

const applyShadowToSvgs = async (svgPaths: string[]) => {
  await Promise.all(svgPaths.map(applyShadowToSvg));
};

const EMPTY_SVG_COMPONENT_SOURCE = `import type { SVGProps } from 'react';

const EmptyGeneratedSvg = (_props: SVGProps<SVGSVGElement>) => null;

export default EmptyGeneratedSvg;
`;

const ensureStubOutputs = async () => {
  const outputDir = path.resolve('src', 'assets', 'SVG', 'generated');
  await fs.mkdir(outputDir, { recursive: true });

  const pages = [
    'home',
    'systems',
  ];
  const names = [
    'heroHeading',
  ];

  const entries = [];

  for (const locale of AVAILABLE_LOCALES) {
    for (const pageName of pages) {
      for (const name of names) {
        const componentName = `${pageName}-${locale}-${name}.gen.tsx`;
        const componentId = `${pageName}-${locale}-${name}-svg`
          .split(/[^a-zA-Z0-9]+/g)
          .filter(Boolean)
          .map((part) => part[0].toUpperCase() + part.slice(1))
          .join('');
        const componentSource = EMPTY_SVG_COMPONENT_SOURCE.replace(
          'EmptyGeneratedSvg',
          `${componentId}Svg`,
        );
        await fs.writeFile(
          path.join(outputDir, componentName),
          componentSource,
          'utf8',
        );
        entries.push({
          locale,
          pageName,
          name,
          componentName,
          componentId: `${componentId}Svg`,
        });
      }
    }
  }

  const imports: string[] = [];
  const localeMap: Map<
    string,
    Map<string, Map<string, string>>
  > = new Map();

  for (const entry of entries) {
    const importId = entry.componentId;
    imports.push(
      `import ${importId} from './${entry.componentName}';`,
    );
    let pageMap = localeMap.get(entry.locale);
    if (!pageMap) {
      pageMap = new Map();
      localeMap.set(entry.locale, pageMap);
    }
    let nameMap = pageMap.get(entry.pageName);
    if (!nameMap) {
      nameMap = new Map();
      pageMap.set(entry.pageName, nameMap);
    }
    nameMap.set(entry.name, importId);
  }

  const localeEntries = [];
  for (const [locale, pagesForLocale] of localeMap) {
    const pageEntries = [];
    for (const [pageName, namesForPage] of pagesForLocale) {
      const nameEntries = [];
      for (const [name, importId] of namesForPage) {
        nameEntries.push(`${name}: ${importId}`);
      }
      pageEntries.push(
        `${pageName}: { ${nameEntries.join(', ')} }`,
      );
    }
    localeEntries.push(
      `${locale}: { ${pageEntries.join(', ')} }`,
    );
  }

  const generatedFile = `// Generated by scripts/buildHeroHeadingSvg.mts
import type { Locale } from '@/lib/locales/translations';
${imports.join('\n')}

export const generatedSvgs = {
  ${localeEntries.join(',\n  ')}
} as const;

export const getLocaleSvgs = (locale: Locale) => generatedSvgs[locale];
`;

  await fs.writeFile(
    path.join(outputDir, 'headingsAsSvgs.ts'),
    generatedFile,
    'utf8',
  );
};

const main = async () => {
  const passThrough = process.argv.slice(2);
  try {
    await execa(
      'node',
      ['scripts/generateSvgFromHeroText.mjs', ...passThrough],
      { stdio: 'inherit' },
    );
  } catch {
    console.warn(
      '[build:hero-svg] SVG capture failed; writing stub outputs instead.',
    );
    await ensureStubOutputs();
    return;
  }
  const svgGlob = '/tmp/heroTextSvg/**/svgs/*.svg';
  await execa(
    'node',
    [
      'scripts/optimizeSvgs.mjs',
      svgGlob,
      '--write',
      '--shorten-ids',
      '--config=svgo.heroHeading.config.mts',
    ],
    { stdio: 'inherit' },
  );
  const svgPaths = await fg(svgGlob, {
    onlyFiles: true,
    dot: false,
    caseSensitiveMatch: false,
  });
  await applyShadowToSvgs(svgPaths);
  await execa(
    'prettier',
    ['--no-config', '--parser', 'html', svgGlob, '--write'],
    { stdio: 'inherit' },
  );

  const outputDir = path.resolve('src', 'assets', 'SVG', 'generated');
  await fs.mkdir(outputDir, { recursive: true });
  const toPascalCase = (value: string) =>
    value
      .split(/[^a-zA-Z0-9]+/g)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
  type SvgEntry = {
    locale: string;
    pageName: string;
    name: string;
    componentName: string;
    componentId: string;
  };

  const entries: SvgEntry[] = await Promise.all(
    svgPaths.map(async (svgPath) => {
      const baseName = path.basename(svgPath);
      const match = baseName.match(/^([^.]+)\.svg$/i);
      const namePart = match ? match[1] : baseName;
      const parts = namePart.split('-');
      const locale = parts.shift() ?? 'unknown';
      const name = parts.join('-') || 'heroHeading';
      const pageName = path.basename(
        path.resolve(svgPath, '..', '..'),
      );
      const componentName = `${pageName}-${locale}-${name}.gen.tsx`;
      const svgContent = await fs.readFile(svgPath, 'utf8');
      const normalizedSvg = svgContent.trim();
      const svgMatch = normalizedSvg.match(
        /^<svg([^>]*)>([\s\S]*)<\/svg>$/i,
      );
      if (!svgMatch) {
        throw new Error(
          `Unable to parse SVG root for ${svgPath}.`,
        );
      }
      const attributes = svgMatch[1].trim();
      const inner = svgMatch[2].trim();
      const toJsxAttrs = (value: string) =>
        value
          .replace(/\bfill-opacity=/gi, 'fillOpacity=')
          .replace(/\bstroke-opacity=/gi, 'strokeOpacity=');
      const jsxAttributes = toJsxAttrs(attributes);
      const jsxInner = inner.replace(
        /<!--([\s\S]*?)-->/g,
        (_match, content: string) =>
          `{/*${content.trim()}*/}`,
      );
      const jsxInnerWithAttrs = toJsxAttrs(jsxInner);
      const jsxInnerIndented = jsxInnerWithAttrs
        .split('\n')
        .map((line) => (line ? `  ${line}` : line))
        .join('\n');
      const componentId =
        toPascalCase(
          `${pageName}-${locale}-${name}`,
        ) + 'Svg';
      const componentSource = `import type { SVGProps } from 'react';

const ${componentId} = (props: SVGProps<SVGSVGElement>) => (
  <svg${jsxAttributes ? ` ${jsxAttributes}` : ''} {...props}>
${jsxInnerIndented}
  </svg>
);

export default ${componentId};
`;
      await fs.writeFile(
        path.join(outputDir, componentName),
        componentSource,
        'utf8',
      );
      return {
        locale,
        pageName,
        name,
        componentName,
        componentId,
      };
    }),
  );

  const imports: string[] = [];
  const localeMap: Map<
    string,
    Map<string, Map<string, string>>
  > = new Map();

  for (const entry of entries) {
    const importId = entry.componentId;
    imports.push(
      `import ${importId} from './${entry.componentName}';`,
    );
    let pageMap = localeMap.get(entry.locale);
    if (!pageMap) {
      pageMap = new Map();
      localeMap.set(entry.locale, pageMap);
    }
    let nameMap = pageMap.get(entry.pageName);
    if (!nameMap) {
      nameMap = new Map();
      pageMap.set(entry.pageName, nameMap);
    }
    nameMap.set(entry.name, importId);
  }

  const localeEntries = [];
  for (const [locale, pages] of localeMap) {
    const pageEntries = [];
    for (const [pageName, names] of pages) {
      const nameEntries = [];
      for (const [name, importId] of names) {
        nameEntries.push(`${name}: ${importId}`);
      }
      pageEntries.push(
        `${pageName}: { ${nameEntries.join(', ')} }`,
      );
    }
    localeEntries.push(
      `${locale}: { ${pageEntries.join(', ')} }`,
    );
  }

  const generatedFile = `// Generated by scripts/buildHeroHeadingSvg.mts
import type { Locale } from '@/lib/locales/translations';
${imports.join('\n')}

export const generatedSvgs = {
  ${localeEntries.join(',\n  ')}
} as const;

export const getLocaleSvgs = (locale: Locale) => generatedSvgs[locale];
`;

  await fs.writeFile(
    path.join(outputDir, 'headingsAsSvgs.ts'),
    generatedFile,
    'utf8',
  );

  await execa('yarn', ['lint:cleanup'], { stdio: 'inherit' });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
