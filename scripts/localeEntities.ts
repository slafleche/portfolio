import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';

import type { Locale } from '../src/lib/locales/translations';
import { MARKDOWN_MESSAGE_KEYS } from '../src/lib/locales/generated/markdown.gen';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { AVAILABLE_LOCALES } = await import(
  '../src/lib/locales/translations'
);

const markdownTarget = '../src/lib/locales/translations/markdown'; // look for fr/en
const dataTargets = [
  {
    filePath: '../src/lib/locales/translations/en.data.ts',
    locale: 'en',
    objectNames: [
      'enBaseData',
    ],
  },
  {
    filePath: '../src/lib/locales/translations/fr.data.ts',
    locale: 'fr',
    objectNames: [
      'frBaseData',
    ],
  },
  {
    filePath: '../src/lib/locales/translations/forms/en.form.ts',
    locale: 'en',
    objectNames: [
      'enFormCopy',
    ],
  },
  {
    filePath: '../src/lib/locales/translations/forms/fr.form.ts',
    locale: 'fr',
    objectNames: [
      'frFormCopy',
    ],
  },
  {
    filePath: '../src/lib/locales/translations/caseStudies/en.caseStudies.ts',
    locale: 'en',
    objectNames: [
      'enCaseStudies',
    ],
  },
  {
    filePath: '../src/lib/locales/translations/caseStudies/fr.caseStudies.ts',
    locale: 'fr',
    objectNames: [
      'frCaseStudies',
    ],
  },
] as const;
const abbrTargets = [
  {
    filePath: '../src/lib/locales/translations/abbreviations/en.abbr.ts',
    locale: 'en',
    objectName: 'enAbbreviations',
  },
  {
    filePath: '../src/lib/locales/translations/abbreviations/fr.abbr.ts',
    locale: 'fr',
    objectName: 'frAbbreviations',
  },
] as const;

type EntityRule = {
  target: string[];
  replacement: string;
};

type EntityConfig = {
  fr: EntityRule[];
  en: EntityRule[];
  entities: string[];
};

const entityConfig: EntityConfig = {
  fr: [
    // BEFORE — narrow no-break space required
    {
      target: [
        ' !',
        '&nbsp;!',
        '&#160;!',
        '&#8239;!',
        '&thinsp;!',
        '&#8201;!',
      ],
      replacement: '&#8239;!',
    },
    {
      target: [
        ' ?',
        '&nbsp;?',
        '&#160;?',
        '&#8239;?',
        '&thinsp;?',
        '&#8201;?',
      ],
      replacement: '&#8239;?',
    },
    {
      target: [
        ' ;',
        '&nbsp;;',
        '&#160;;',
        '&#8239;;',
        '&thinsp;;',
        '&#8201;;',
      ],
      replacement: '&#8239;;',
    },
    {
      target: [
        ' :',
        '&nbsp;:',
        '&#160;:',
        '&#8239;:',
        '&thinsp;:',
        '&#8201;:',
      ],
      replacement: '&#8239;:',
    },
  ],
  en: [],
  entities: [
    '&nbsp;', // non-breaking space (U+00A0)
    '&ensp;', // en space (U+2002)
    '&emsp;', // em space (U+2003)
    '&thinsp;', // thin space (U+2009)
    '&shy;', // soft hyphen (U+00AD, discretionary)

    '&quot;', // "
    '&apos;', // '
    '&mdash;', // —
    '&ndash;', // –
    '&hellip;', // …
    '&laquo;', // «
    '&raquo;', // »
    '&lsaquo;', // ‹
    '&rsaquo;', // ›
    '&middot;', // ·
    '&bull;', // •

    // "&lt;",      // <
    // "&gt;",      // >
    // "&le;",      // ≤
    // "&ge;",      // ≥
    // "&ne;",      // ≠
    // "&asymp;",   // ≈
    // "&equiv;",   // ≡

    // "&plusmn;",  // ±
    // "&times;",   // ×
    // "&divide;",  // ÷
    // "&radic;",   // √
    // "&infin;",   // ∞
    // "&sum;",     // ∑
    // "&prod;",    // ∏
    // "&deg;",     // °

    // "&dollar;",  // $
    // "&cent;",    // ¢
    // "&pound;",   // £
    // "&yen;",     // ¥
    // "&euro;",    // €

    // "&copy;",    // ©
    // "&reg;",     // ®
    // "&trade;"    // ™
  ],
};

const ENTITY_CHAR_MAP: Record<string, string> = {
  '&nbsp;': '\u00a0',
  '&ensp;': '\u2002',
  '&emsp;': '\u2003',
  '&thinsp;': '\u2009',
  '&shy;': '\u00ad',
  '&quot;': '"',
  '&apos;': "'",
  '&mdash;': '\u2014',
  '&ndash;': '\u2013',
  '&hellip;': '\u2026',
  '&laquo;': '\u00ab',
  '&raquo;': '\u00bb',
  '&lsaquo;': '\u2039',
  '&rsaquo;': '\u203a',
  '&middot;': '\u00b7',
  '&bull;': '\u2022',
  '&lt;': '<',
  '&gt;': '>',
  '&le;': '\u2264',
  '&ge;': '\u2265',
  '&ne;': '\u2260',
  '&asymp;': '\u2248',
  '&equiv;': '\u2261',
  '&plusmn;': '\u00b1',
  '&times;': '\u00d7',
  '&divide;': '\u00f7',
  '&radic;': '\u221a',
  '&infin;': '\u221e',
  '&sum;': '\u2211',
  '&prod;': '\u220f',
  '&deg;': '\u00b0',
  '&dollar;': '$',
  '&cent;': '\u00a2',
  '&pound;': '\u00a3',
  '&yen;': '\u00a5',
  '&euro;': '\u20ac',
  '&copy;': '\u00a9',
  '&reg;': '\u00ae',
  '&trade;': '\u2122',
};

const decodeEntity = (entity: string) => {
  if (ENTITY_CHAR_MAP[entity]) return ENTITY_CHAR_MAP[entity];
  const numericMatch = entity.match(/^&#(\d+);$/);
  if (numericMatch) {
    return String.fromCodePoint(Number(numericMatch[1]));
  }
  const hexMatch = entity.match(/^&#x([0-9a-fA-F]+);$/);
  if (hexMatch) {
    return String.fromCodePoint(parseInt(hexMatch[1], 16));
  }
  return entity;
};

const decodeEntitiesInText = (input: string) =>
  input.replace(/&[#a-zA-Z0-9]+;/g, (match) => decodeEntity(match));

const applyEntityRules = (
  input: string,
  rules: EntityRule[],
) => {
  let output = input;
  for (const rule of rules) {
    const replacement = decodeEntitiesInText(rule.replacement);
    for (const target of rule.target) {
      output = output.replaceAll(target, replacement);
    }
  }
  return output;
};

const applyGlobalEntities = (
  input: string,
  entities: string[],
) => {
  let output = input;
  for (const entity of entities) {
    const replacement = decodeEntitiesInText(entity);
    if (replacement === entity) continue;
    output = output.replaceAll(entity, replacement);
  }
  return output;
};

const applyEntitiesForLocale = (
  input: string,
  locale: Locale,
) => {
  let output = input;
  if (locale === 'fr') {
    output = applyEntityRules(output, entityConfig.fr);
  }
  if (locale === 'en') {
    output = applyEntityRules(output, entityConfig.en);
  }
  return applyGlobalEntities(output, entityConfig.entities);
};

const escapeForQuote = (value: string, quote: string) => {
  let escaped = value.replace(/\\/g, '\\\\');
  if (quote === "'") escaped = escaped.replace(/'/g, "\\'");
  if (quote === '"') escaped = escaped.replace(/"/g, '\\"');
  if (quote === '`') {
    escaped = escaped.replace(/`/g, '\\`');
    escaped = escaped.replace(/\$\{/g, '\\${');
    return escaped;
  }
  escaped = escaped.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
  return escaped;
};

const applyReplacements = (
  sourceText: string,
  replacements: Array<{
    start: number;
    end: number;
    text: string;
  }>,
) => {
  let updated = sourceText;
  const sorted = replacements.sort((a, b) => b.start - a.start);
  for (const replacement of sorted) {
    updated =
      updated.slice(0, replacement.start) +
      replacement.text +
      updated.slice(replacement.end);
  }
  return updated;
};

const collectObjectLiteralReplacements = (
  sourceText: string,
  sourceFile: ts.SourceFile,
  objectName: string,
  locale: Locale,
  markdownKeySet: Set<string>,
) => {
  const replacements: Array<{
    start: number;
    end: number;
    text: string;
  }> = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(sourceFile) === objectName &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const initializer = prop.initializer;
        if (
          !ts.isStringLiteral(initializer) &&
          !ts.isNoSubstitutionTemplateLiteral(initializer)
        ) {
          continue;
        }

        const originalValue = initializer.text;
        if (markdownKeySet.has(originalValue)) continue;

        const updatedValue = applyEntitiesForLocale(
          originalValue,
          locale,
        );
        if (updatedValue === originalValue) continue;

        const start = initializer.getStart(sourceFile);
        const end = initializer.getEnd();
        const originalLiteral = sourceText.slice(start, end);
        const quote = originalLiteral[0] ?? "'";
        const escaped = escapeForQuote(updatedValue, quote);
        const replacement = `${quote}${escaped}${quote}`;
        replacements.push({
          start,
          end,
          text: replacement,
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return replacements;
};

const collectAbbreviationReplacements = (
  sourceText: string,
  sourceFile: ts.SourceFile,
  objectName: string,
  locale: Locale,
  markdownKeySet: Set<string>,
) => {
  const replacements: Array<{
    start: number;
    end: number;
    text: string;
  }> = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(sourceFile) === objectName &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        if (!ts.isObjectLiteralExpression(prop.initializer)) continue;

        for (const entry of prop.initializer.properties) {
          if (!ts.isPropertyAssignment(entry)) continue;
          const name = entry.name.getText(sourceFile);
          if (name !== 'definition' && name !== "'definition'" && name !== '"definition"') {
            continue;
          }
          const initializer = entry.initializer;
          if (
            !ts.isStringLiteral(initializer) &&
            !ts.isNoSubstitutionTemplateLiteral(initializer)
          ) {
            continue;
          }

          const originalValue = initializer.text;
          if (markdownKeySet.has(originalValue)) continue;

          const updatedValue = applyEntitiesForLocale(
            originalValue,
            locale,
          );
          if (updatedValue === originalValue) continue;

          const start = initializer.getStart(sourceFile);
          const end = initializer.getEnd();
          const originalLiteral = sourceText.slice(start, end);
          const quote = originalLiteral[0] ?? "'";
          const escaped = escapeForQuote(updatedValue, quote);
          const replacement = `${quote}${escaped}${quote}`;
          replacements.push({
            start,
            end,
            text: replacement,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return replacements;
};

export const applyLocaleEntitiesToDataFiles = async () => {
  const markdownKeySet = new Set<string>(MARKDOWN_MESSAGE_KEYS);
  for (const target of dataTargets) {
    const filePath = path.resolve(__dirname, target.filePath);
    const sourceText = await fs.readFile(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    let replacements: Array<{
      start: number;
      end: number;
      text: string;
    }> = [];
    for (const objectName of target.objectNames) {
      replacements = replacements.concat(
        collectObjectLiteralReplacements(
          sourceText,
          sourceFile,
          objectName,
          target.locale,
          markdownKeySet,
        ),
      );
    }

    if (replacements.length === 0) continue;
    const updated = applyReplacements(sourceText, replacements);
    if (updated !== sourceText) {
      await fs.writeFile(filePath, updated, 'utf8');
    }
  }

  for (const target of abbrTargets) {
    const filePath = path.resolve(__dirname, target.filePath);
    const sourceText = await fs.readFile(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    const replacements = collectAbbreviationReplacements(
      sourceText,
      sourceFile,
      target.objectName,
      target.locale,
      markdownKeySet,
    );

    if (replacements.length === 0) continue;
    const updated = applyReplacements(sourceText, replacements);
    if (updated !== sourceText) {
      await fs.writeFile(filePath, updated, 'utf8');
    }
  }
};

const getLocaleFromFilename = (
  filename: string,
  localeSet: Set<Locale>,
): Locale | null => {
  const [candidate] = filename.split('-');
  if (!candidate) return null;
  if (localeSet.has(candidate as Locale)) {
    return candidate as Locale;
  }
  return null;
};

const listMarkdownFiles = async (
  dir: string,
): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(entryPath);
    }
  }
  return results;
};

export const applyLocaleEntitiesToMarkdown = async () => {
  console.log('⚙️  locale entities linting');

  const localeSet = new Set<Locale>(AVAILABLE_LOCALES);
  const markdownDir = path.resolve(__dirname, markdownTarget);
  const files = await listMarkdownFiles(markdownDir);
  const entries = files
    .map((filePath) => {
      const locale = getLocaleFromFilename(
        path.basename(filePath),
        localeSet,
      );
      if (!locale) return null;
      return { locale, filePath };
    })
    .filter((entry): entry is { locale: Locale; filePath: string } =>
      Boolean(entry)
    )
    .sort((a, b) => {
      const localeCompare = a.locale.localeCompare(b.locale);
      if (localeCompare !== 0) return localeCompare;
      return a.filePath.localeCompare(b.filePath);
    });

  let frChanges = 0;
  let enChanges = 0;
  let entityChanges = 0;

  for (const { locale, filePath } of entries) {
    const original = await fs.readFile(filePath, 'utf8');
    let next = original;
    if (locale === 'fr') {
      const updated = applyEntityRules(next, entityConfig.fr);
      if (updated !== next) {
        frChanges += 1;
        next = updated;
      }
    }
    if (locale === 'en') {
      const updated = applyEntityRules(next, entityConfig.en);
      if (updated !== next) {
        enChanges += 1;
        next = updated;
      }
    }
    const entityUpdated = applyGlobalEntities(
      next,
      entityConfig.entities,
    );
    if (entityUpdated !== next) {
      entityChanges += 1;
      next = entityUpdated;
    }

    if (next !== original) {
      await fs.writeFile(filePath, next, 'utf8');
    }
  }

  console.log('➡️  Checking FR');
  console.log(
    frChanges > 0 ? `FR changes: ${frChanges}` : 'FR changes: none',
  );
  console.log('➡️  Checking En');
  console.log(
    enChanges > 0 ? `EN changes: ${enChanges}` : 'EN changes: none',
  );
  console.log('⌗  Checking HTML entities');
  console.log(
    entityChanges > 0
      ? `HTML entity changes: ${entityChanges}`
      : 'HTML entity changes: none',
  );
};
