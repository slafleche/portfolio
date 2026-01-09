import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MARKDOWN_MESSAGE_KEYS,
  MARKDOWN_MESSAGES,
} from '../src/lib/locales/generated/markdown.gen';
import type { LocaleMessagesShape } from '../src/lib/locales/localeTypes';
import type { Locale } from '../src/lib/locales/translations';
import { resolveAbbrShortcodes } from '../src/lib/locales/translations/resolveAbbrShortcodes';

type MarkdownKey = (typeof MARKDOWN_MESSAGE_KEYS)[number];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownDir = path.resolve(
  __dirname,
  '../src/lib/locales/translations/markdown',
);

const { AVAILABLE_LOCALES, LOCALE_LOADERS } = await import(
  '../src/lib/locales/translations'
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

const loadLocaleMessages = async (
  locale: Locale,
): Promise<LocaleMessagesShape | null> => {
  try {
    const mod = await LOCALE_LOADERS[locale]();
    return mod.default as LocaleMessagesShape;
  } catch (error) {
    recordIssue({
      locale,
      key: '*',
      reason: `failed to load messages (${getErrorMessage(error)})`,
    });
    return null;
  }
};

const SYSTEMS_MARKDOWN_KEYS = new Set([
  'architecture-content',
  'blurb-content',
  'expertise-content',
  'principles-content',
]);

const getSectionForKey = (key: string) => {
  if (key.startsWith('systems-')) return 'systems';
  if (SYSTEMS_MARKDOWN_KEYS.has(key)) return 'systems';
  if (key.startsWith('forms-')) return 'contact';
  return 'home';
};

const readMarkdownFor = async (
  key: MarkdownKey,
  locale: Locale,
): Promise<string | null> => {
  const section = getSectionForKey(key);
  const fileName = `${locale}-${section}-${key.replace(/-/g, '_')}.md`;
  const filePath = path.join(markdownDir, fileName);
  try {
    const content = await fs.readFile(filePath, 'utf8');
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

const ensureGeneratedContentIsCurrent = (
  key: MarkdownKey,
  locale: Locale,
  expected: string,
) => {
  const generated = MARKDOWN_MESSAGES[locale]?.[key];
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

const main = async () => {
  const localeMessages: Array<{
    locale: Locale;
    messages: LocaleMessagesShape;
  }> = [];
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

      if (MARKDOWN_MESSAGE_KEYS.includes(key as MarkdownKey)) {
        const expected = await readMarkdownFor(
          key as MarkdownKey,
          locale,
        );
        if (expected == null) continue;

        ensureGeneratedContentIsCurrent(
          key as MarkdownKey,
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
