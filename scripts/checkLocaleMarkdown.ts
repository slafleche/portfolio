import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';

import type { LocaleMessagesShape } from '../src/lib/locales/localeTypes';
import type { Locale } from '../src/lib/locales/translations';
import { resolveAbbrShortcodes } from '../src/lib/locales/translations/resolveAbbrShortcodes';
import {
  buildFileContents,
  readMarkdownFiles,
} from './generateLocaleMarkdown';
import {
  applyLocaleEntitiesToDataFiles,
  applyLocaleEntitiesToMarkdown,
} from './localeEntities';

type MarkdownKey = string;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownDir = path.resolve(
  __dirname,
  '../src/lib/locales/translations/markdown',
);
const outputPath = path.resolve(
  __dirname,
  '../src/lib/locales/generated/markdown.gen.ts',
);

type Issue = {
  locale: Locale;
  key: string;
  reason: string;
};

const issuesByLocale = new Map<Locale, Issue[]>();

const isErrno = (error: unknown): error is NodeJS.ErrnoException =>
  typeof error === 'object' && error !== null && 'code' in error;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const recordIssue = (issue: Issue) => {
  const list = issuesByLocale.get(issue.locale);
  if (list) list.push(issue);
  else
    issuesByLocale.set(issue.locale, [
      issue,
    ]);
};

const SYSTEMS_MARKDOWN_KEYS = new Set([
  'architecture-content',
  'calipers-content',
  'expertise-content',
  'principles-content',
  'tetrachromatic-content',
]);

const getSectionForKey = (key: string) => {
  if (key.startsWith('systems-')) return 'systems';
  if (SYSTEMS_MARKDOWN_KEYS.has(key)) return 'systems';
  if (key.startsWith('forms-')) return 'contact';
  return 'home';
};

const FRENCH_BANNED_TERMS = [
  'themable',
  'theming',
  'themer',
  'theme',
] as const;

const FRENCH_BANNED_TERMS_REGEX = new RegExp(
  `\\b(?:${FRENCH_BANNED_TERMS.join('|')})\\b`,
  'i',
);

const findEmDashIssue = (markdown: string) => {
  const patterns: Array<{ needle: string; label: string }> = [
    { needle: '—', label: '—' },
    { needle: '&mdash;', label: '&mdash;' },
    { needle: '&#8212;', label: '&#8212;' },
    { needle: '&#x2014;', label: '&#x2014;' },
    { needle: '&#X2014;', label: '&#X2014;' },
  ];

  let bestMatch: { index: number; label: string } | null = null;
  for (const { needle, label } of patterns) {
    const index = markdown.indexOf(needle);
    if (index === -1) continue;
    if (!bestMatch || index < bestMatch.index) {
      bestMatch = { index, label };
    }
  }

  if (!bestMatch) return null;

  const before = markdown.slice(0, bestMatch.index);
  const line = before.split('\n').length;
  const lastNewlineIndex = before.lastIndexOf('\n');
  const column =
    lastNewlineIndex === -1
      ? bestMatch.index + 1
      : bestMatch.index - lastNewlineIndex;

  return {
    label: bestMatch.label,
    line,
    column,
  };
};

const INVISIBLE_BEFORE_FENCE = [
  { char: '\u200B', label: 'U+200B (zero-width space)' },
  { char: '\uFEFF', label: 'U+FEFF (byte order mark)' },
  { char: '\u200E', label: 'U+200E (left-to-right mark)' },
  { char: '\u200F', label: 'U+200F (right-to-left mark)' },
] as const;

const findInvisibleBeforeFenceIssue = (markdown: string) => {
  const fencePattern = /(^|\n)([^\n]*?)(```|~~~)/g;
  let match: RegExpExecArray | null;

  while ((match = fencePattern.exec(markdown)) !== null) {
    const prefix = match[2] ?? '';
    const prefixIndex = match.index + (match[1]?.length ?? 0);

    for (const { char, label } of INVISIBLE_BEFORE_FENCE) {
      const hit = prefix.indexOf(char);
      if (hit === -1) continue;

      const absoluteIndex = prefixIndex + hit;
      const before = markdown.slice(0, absoluteIndex);
      const line = before.split('\n').length;
      const lastNewlineIndex = before.lastIndexOf('\n');
      const column =
        lastNewlineIndex === -1
          ? absoluteIndex + 1
          : absoluteIndex - lastNewlineIndex;

      return {
        label,
        line,
        column,
      };
    }
  }

  return null;
};

const findFrenchBannedTermIssue = (text: string) => {
  const match = FRENCH_BANNED_TERMS_REGEX.exec(text);
  if (!match || match.index === undefined) return null;

  const before = text.slice(0, match.index);
  const line = before.split('\n').length;
  const lastNewlineIndex = before.lastIndexOf('\n');
  const column =
    lastNewlineIndex === -1
      ? match.index + 1
      : match.index - lastNewlineIndex;

  return {
    term: match[0],
    line,
    column,
  };
};

const referencedFrenchMarkdownFiles = new Set<string>();

const readMarkdownFor = async (
  key: MarkdownKey,
  locale: Locale,
): Promise<string | null> => {
  const section = getSectionForKey(key);
  const fileName = `${locale}-${section}-${key.replace(/-/g, '_')}.md`;
  if (locale === 'fr') referencedFrenchMarkdownFiles.add(fileName);
  const filePath = path.join(markdownDir, fileName);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    if (locale === 'fr') {
      const bannedIssue = findFrenchBannedTermIssue(content);
      if (bannedIssue) {
        recordIssue({
          locale,
          key,
          reason: `contains banned english term (${bannedIssue.term}) at line ${bannedIssue.line}, column ${bannedIssue.column}`,
        });
      }
    }
    const emDashIssue = findEmDashIssue(content);
    if (emDashIssue) {
      recordIssue({
        locale,
        key,
        reason: `contains em dash (${emDashIssue.label}) at line ${emDashIssue.line}, column ${emDashIssue.column}`,
      });
    }
    const invisibleFenceIssue = findInvisibleBeforeFenceIssue(content);
    if (invisibleFenceIssue) {
      recordIssue({
        locale,
        key,
        reason: `contains invisible character ${invisibleFenceIssue.label} before fenced code block at line ${invisibleFenceIssue.line}, column ${invisibleFenceIssue.column}`,
      });
    }
    return content;
  } catch (error) {
    if (isErrno(error) && error.code === 'ENOENT') {
      recordIssue({
        locale,
        key,
        reason: `missing markdown file (${fileName})`,
      });
      return null;
    }
    throw error;
  }
};

const scanAllFrenchMarkdownFiles = async () => {
  const entries = await fs.readdir(markdownDir, {
    withFileTypes: true,
  });
  const fileNames = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.startsWith('fr-') &&
        entry.name.endsWith('.md'),
    )
    .map((entry) => entry.name);

  for (const fileName of fileNames) {
    if (referencedFrenchMarkdownFiles.has(fileName)) continue;
    const filePath = path.join(markdownDir, fileName);
    const content = await fs.readFile(filePath, 'utf8');

    const bannedIssue = findFrenchBannedTermIssue(content);
    if (bannedIssue) {
      recordIssue({
        locale: 'fr',
        key: fileName,
        reason: `contains banned english term (${bannedIssue.term}) at line ${bannedIssue.line}, column ${bannedIssue.column}`,
      });
    }

    const emDashIssue = findEmDashIssue(content);
    if (emDashIssue) {
      recordIssue({
        locale: 'fr',
        key: fileName,
        reason: `contains em dash (${emDashIssue.label}) at line ${emDashIssue.line}, column ${emDashIssue.column}`,
      });
    }
  }
};

const scanFrenchDataFile = async () => {
  const frDataPath = path.resolve(
    __dirname,
    '../src/lib/locales/translations/fr.data.ts',
  );
  const sourceText = await fs.readFile(frDataPath, 'utf8');
  const sourceFile = ts.createSourceFile(
    frDataPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const recordBannedAtPos = (
    term: string,
    pos: number,
  ) => {
    const { line, character } =
      sourceFile.getLineAndCharacterOfPosition(pos);
    recordIssue({
      locale: 'fr',
      key: 'fr.data.ts',
      reason: `contains banned english term (${term}) at line ${line + 1}, column ${character + 1}`,
    });
  };

  const visit = (node: ts.Node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      const raw = node.getText(sourceFile);
      const rawInner = raw.length >= 2 ? raw.slice(1, -1) : '';
      const match = FRENCH_BANNED_TERMS_REGEX.exec(rawInner);
      if (match && match.index !== undefined) {
        const absolute =
          node.getStart(sourceFile) + 1 + match.index;
        recordBannedAtPos(match[0], absolute);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
};

const ensureGeneratedContentIsCurrent = (
  markdownMessages: Record<Locale, Record<string, string>>,
  key: string,
  locale: Locale,
  expected: string,
) => {
  const generated = markdownMessages[locale]?.[key];
  if (generated === undefined) {
    recordIssue({
      locale,
      key,
      reason: 'generated map missing markdown content',
    });
    return;
  }

  if (generated !== expected) {
    recordIssue({
      locale,
      key,
      reason: 'generated map is out of sync with markdown file',
    });
  }
};

const extractAbbreviationEntries = (
  messages: LocaleMessagesShape,
) => {
  const entries: Record<string, unknown> = {};
  for (const [
    key,
    value,
  ] of Object.entries(messages)) {
    if (key.startsWith('abbr-')) {
      entries[key] = value;
    }
  }
  return entries;
};

const transformMarkdownWithAbbr = (
  locale: Locale,
  markdown: string,
  abbrEntries: Record<string, unknown>,
) => {
  const payload: Record<string, unknown> & { __content: string } = {
    ...abbrEntries,
    __content: markdown,
  };
  const resolved = resolveAbbrShortcodes(payload, locale);
  return resolved.__content;
};

const regenerateMarkdownGenerated = async () => {
  const { messages, keys } = await readMarkdownFiles();
  const fileContents = buildFileContents(messages, keys);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, fileContents, 'utf8');
};

const main = async () => {
  await applyLocaleEntitiesToDataFiles();
  await applyLocaleEntitiesToMarkdown();
  await scanFrenchDataFile();
  await regenerateMarkdownGenerated();

  const { AVAILABLE_LOCALES, LOCALE_LOADERS } = await import(
    '../src/lib/locales/translations'
  );
  const { MARKDOWN_MESSAGE_KEYS, MARKDOWN_MESSAGES } = await import(
    '../src/lib/locales/generated/markdown.gen'
  );

  const loadLocaleMessages = async (
    locale: Locale,
  ): Promise<LocaleMessagesShape | null> => {
    try {
      const mod = await LOCALE_LOADERS[locale]();
      return mod.default;
    } catch (error) {
      recordIssue({
        locale,
        key: '*',
        reason: `failed to load messages (${getErrorMessage(error)})`,
      });
      return null;
    }
  };

  const localeMessages: Array<{
    locale: Locale;
    messages: LocaleMessagesShape;
  }> = [];
  const markdownMessageKeySet = new Set<string>(
    MARKDOWN_MESSAGE_KEYS,
  );
  const allKeys = new Set<string>(MARKDOWN_MESSAGE_KEYS);

  for (const locale of AVAILABLE_LOCALES) {
    const messages = await loadLocaleMessages(locale);
    if (!messages) continue;

    localeMessages.push({ locale, messages });
    for (const key of Object.keys(messages)) {
      allKeys.add(key);
    }
  }

  for (const { locale, messages } of localeMessages) {
    const abbrEntries = extractAbbreviationEntries(messages);

    for (const key of allKeys) {
      const value = (messages as Record<string, unknown>)[key];

      if (value === undefined) {
        recordIssue({
          locale,
          key,
          reason: 'missing message value (resolved to undefined)',
        });
        continue;
      }

      if (markdownMessageKeySet.has(key)) {
        const expected = await readMarkdownFor(key, locale);
        if (expected == null) continue;

        ensureGeneratedContentIsCurrent(
          MARKDOWN_MESSAGES,
          key,
          locale,
          expected,
        );

        if (typeof value !== 'string') {
          recordIssue({
            locale,
            key,
            reason: `expected string value, received ${typeof value}`,
          });
          continue;
        }

        const processedExpected = transformMarkdownWithAbbr(
          locale,
          expected,
          abbrEntries,
        );

        if (value !== processedExpected) {
          recordIssue({
            locale,
            key,
            reason: 'message value does not match markdown content',
          });
        }
      }
    }
  }

  await scanAllFrenchMarkdownFiles();

  if (issuesByLocale.size === 0) {
    console.log('✅ lint:locale markdown checks passed');
    return;
  }

  console.error('⚠️  Locale markdown issues found:');
  for (const [
    locale,
    localeIssues,
  ] of issuesByLocale) {
    console.error(`  - [${locale}]`);
    for (const { key, reason } of localeIssues) {
      console.error(`      • ${key}: ${reason}`);
    }
  }
  process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
