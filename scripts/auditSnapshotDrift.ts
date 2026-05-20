/**
 * Audits drift between the home-page copy snapshots (ai/home.{en,fr}.md),
 * the source map (ai/home.en.map.md), and the canonical locale source
 * (src/lib/locales/translations/{en,fr}.data.ts +
 * caseStudies/{en,fr}.caseStudies.ts + markdown/*.md).
 *
 * What it catches:
 *   - Title / subtitle drift: snapshot H2 `## key (title): VALUE` and H3
 *     `### key-(title|subtitle): VALUE` lines whose VALUE no longer matches
 *     the source string for that key.
 *   - Body drift: every markdown-backed section in the snapshot whose body
 *     text no longer matches the source markdown file (whitespace-normalized).
 *   - Stale source map references: locale keys or markdown filenames cited
 *     in home.en.map.md that no longer exist.
 *
 * What it does NOT catch (LLM `sync-copy` skill territory):
 *   - Structural prose claims in `## toc` lead-in or `## notes` blocks.
 *   - Whether the snapshot matches the rendered HTML (Step 5 of the skill).
 *
 * Exits 0 when clean, 1 when drift found, 2 on unexpected error.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { enData } from '../src/lib/locales/translations/en.data.ts';
import { frData } from '../src/lib/locales/translations/fr.data.ts';
import { readMarkdownFiles } from './generateLocaleMarkdown.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT_PATHS = {
  en: path.resolve(REPO_ROOT, 'ai/home.en.md'),
  fr: path.resolve(REPO_ROOT, 'ai/home.fr.md'),
} as const;
const MAP_PATH = path.resolve(REPO_ROOT, 'ai/home.en.map.md');
const MARKDOWN_DIR = path.resolve(
  REPO_ROOT,
  'src/lib/locales/translations/markdown',
);

type Locale = 'en' | 'fr';
const LOCALES: readonly Locale[] = ['en', 'fr'] as const;

const SOURCES: Record<Locale, Record<string, unknown>> = {
  en: enData,
  fr: frData,
};

const MARKDOWN_PLACEHOLDER_PREFIX = '__MARKDOWN_REF__:';

type Issue = {
  kind:
    | 'title-drift'
    | 'body-drift'
    | 'orphan-source-key'
    | 'orphan-body-section'
    | 'map-stale-key'
    | 'map-stale-file';
  locale?: Locale;
  key?: string;
  detail: string;
};

const issues: Issue[] = [];
const record = (issue: Issue) => issues.push(issue);

const sourceStringValue = (
  locale: Locale,
  key: string,
): string | null | undefined => {
  const value = SOURCES[locale][key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return null;
  if (value.startsWith(MARKDOWN_PLACEHOLDER_PREFIX)) return null;
  return value;
};

const titleEqual = (a: string, b: string): boolean =>
  normalizeQuotes(a) === normalizeQuotes(b);

// === Audit 1: H2 / H3 title and subtitle drift ===

const auditTitlesAndSubtitles = (locale: Locale, snapshot: string) => {
  for (const rawLine of snapshot.split('\n')) {
    // Stop at the local-scratch sections at the bottom of the snapshot.
    if (/^## (toc|notes|feedback drafts)/.test(rawLine)) break;

    // ## key (title): VALUE   — used for H2 section titles (e.g. design_systems, tnb_case_study)
    let match = rawLine.match(
      /^## ([a-z][a-z0-9_]*) \(title\): (.+)$/,
    );
    if (match) {
      const [, key, snapValue] = match;
      const src = sourceStringValue(locale, key);
      if (src === undefined) {
        record({
          kind: 'orphan-source-key',
          locale,
          key,
          detail: `H2 '## ${key} (title): ...' references key not in source`,
        });
      } else if (src !== null && !titleEqual(src, snapValue)) {
        record({
          kind: 'title-drift',
          locale,
          key,
          detail: `H2 '${key}' title drift: snapshot=${JSON.stringify(snapValue)} source=${JSON.stringify(src)}`,
        });
      }
      continue;
    }

    // ## key (title now: "VALUE")  — used when the rendered title differs from the key word (e.g. summary → "About me")
    match = rawLine.match(
      /^## ([a-z][a-z0-9_]*) \(title now: ['"](.+)['"]\)$/,
    );
    if (match) {
      const [, key, snapValue] = match;
      const src = sourceStringValue(locale, key);
      if (src === undefined) {
        record({
          kind: 'orphan-source-key',
          locale,
          key,
          detail: `H2 '## ${key} (title now: ...)' references key not in source`,
        });
      } else if (src !== null && !titleEqual(src, snapValue)) {
        record({
          kind: 'title-drift',
          locale,
          key,
          detail: `H2 '${key}' rendered-title drift: snapshot=${JSON.stringify(snapValue)} source=${JSON.stringify(src)}`,
        });
      }
      continue;
    }

    // ### key-(title|subtitle): VALUE
    match = rawLine.match(
      /^### ([a-z0-9-]+-(?:title|subtitle)): (.+)$/,
    );
    if (match) {
      const [, key, snapValue] = match;
      const src = sourceStringValue(locale, key);
      if (src === undefined) {
        record({
          kind: 'orphan-source-key',
          locale,
          key,
          detail: `H3 '### ${key}: ...' references key not in source`,
        });
      } else if (src !== null && !titleEqual(src, snapValue)) {
        record({
          kind: 'title-drift',
          locale,
          key,
          detail: `H3 '${key}' drift: snapshot=${JSON.stringify(snapValue)} source=${JSON.stringify(src)}`,
        });
      }
    }
  }
};

// === Audit 2: body drift ===

// Parses the snapshot into "logical sections" where each section has an
// optional `bodyKey` naming the markdown-backed key whose content lives
// in this section's body. Subtitle lines are absorbed as metadata and not
// counted as section openers.
//
// Header → bodyKey derivation rules:
//   ## key                       → `${key.replace(/_/g, '-')}-content` (if markdown-backed)
//   ## key (title now: "...")    → same
//   ## key (title): ...          → same
//   ### key-title: ...           → `${key}-content` (if markdown-backed)
//   ### key-subtitle: ...        → absorbed as metadata, no new section
//   ### key  (no role)           → `key` itself (if markdown-backed) — covers
//                                  -intro / -outro / -content keys that have
//                                  their own H3.
//   Any other ### header         → in-body content, appended to body buffer.
const parseSnapshotSections = (
  snapshot: string,
  markdownKeys: Set<string>,
): Array<{ bodyKey: string | null; body: string }> => {
  const sections: Array<{ bodyKey: string | null; body: string }> = [];
  type CurrentSection = { bodyKey: string | null; body: string[] };
  const state: { current: CurrentSection | null } = { current: null };
  let stopped = false;

  const finishCurrent = () => {
    if (state.current) {
      sections.push({
        bodyKey: state.current.bodyKey,
        body: state.current.body.join('\n').trim(),
      });
      state.current = null;
    }
  };
  const openSection = (bodyKey: string | null) => {
    finishCurrent();
    state.current = { bodyKey, body: [] };
  };

  const isMd = (key: string) => markdownKeys.has(key);

  const H2_OPENER = /^## (?!#)/;
  const H2_LOWERCASE_KEY = /^## ([a-z][a-z0-9_]*)\b/;
  const H3_TITLE = /^### ([a-z0-9-]+?)-title: .+$/;
  const H3_SUBTITLE = /^### ([a-z0-9-]+?)-subtitle: .+$/;
  const H3_BARE_KEY = /^### ([a-z][a-z0-9-]*)\s*$/;

  for (const rawLine of snapshot.split('\n')) {
    if (stopped) break;
    if (/^## (toc|notes|feedback drafts)/.test(rawLine)) {
      stopped = true;
      break;
    }

    // H2: any `## ...` line closes the current section.
    if (H2_OPENER.test(rawLine)) {
      const keyMatch = rawLine.match(H2_LOWERCASE_KEY);
      if (keyMatch) {
        const key = keyMatch[1];
        const contentKey = `${key.replace(/_/g, '-')}-content`;
        openSection(isMd(contentKey) ? contentKey : null);
      } else {
        // e.g. `## Code Quality Guardrails`. Opens a non-body-keyed section.
        openSection(null);
      }
      continue;
    }

    // H3 patterns. Order matters: -title and -subtitle before bare-key.
    let match = rawLine.match(H3_TITLE);
    if (match) {
      const slug = match[1];
      const contentKey = `${slug}-content`;
      openSection(isMd(contentKey) ? contentKey : null);
      continue;
    }

    if (H3_SUBTITLE.test(rawLine)) {
      // metadata for the current title section; don't open or close
      continue;
    }

    match = rawLine.match(H3_BARE_KEY);
    if (match && isMd(match[1])) {
      openSection(match[1]);
      continue;
    }

    // Anything else (including in-body H3 sub-headings like
    // `### A few examples in the wild:`) is body content.
    if (state.current) state.current.body.push(rawLine);
  }

  finishCurrent();
  return sections;
};

const normalizeQuotes = (text: string): string =>
  text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"');

const normalize = (text: string): string =>
  normalizeQuotes(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '---')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const auditBodyDrift = (
  locale: Locale,
  snapshot: string,
  markdownByKey: Record<string, string>,
) => {
  const markdownKeys = new Set(Object.keys(markdownByKey));
  const sections = parseSnapshotSections(snapshot, markdownKeys);
  const seen = new Set<string>();

  for (const section of sections) {
    if (!section.bodyKey) continue;
    seen.add(section.bodyKey);
    const expected = markdownByKey[section.bodyKey];
    if (expected === undefined) {
      record({
        kind: 'orphan-body-section',
        locale,
        key: section.bodyKey,
        detail: `snapshot section maps to body key '${section.bodyKey}' but no markdown file found`,
      });
      continue;
    }
    const snapNorm = normalize(section.body);
    const srcNorm = normalize(expected);
    if (snapNorm !== srcNorm) {
      // Find the first character that differs, then show a ~80-char window around it.
      let diffAt = 0;
      const minLen = Math.min(snapNorm.length, srcNorm.length);
      while (
        diffAt < minLen &&
        snapNorm.charCodeAt(diffAt) === srcNorm.charCodeAt(diffAt)
      ) {
        diffAt++;
      }
      const start = Math.max(0, diffAt - 30);
      const window = (s: string) =>
        `${start > 0 ? '…' : ''}${s.slice(start, diffAt + 80)}${s.length > diffAt + 80 ? '…' : ''}`;
      record({
        kind: 'body-drift',
        locale,
        key: section.bodyKey,
        detail: `body drift for '${section.bodyKey}' (first diff at char ${diffAt})\n      snapshot: ${window(snapNorm)}\n      source:   ${window(srcNorm)}`,
      });
    }
  }

  // Surface markdown-backed keys that exist in source but have NO matching
  // snapshot section — these are usually fine for the EN snapshot (the
  // snapshot covers the home page; other pages may have markdown too) but
  // worth flagging if the home page locale source uses a key that the home
  // snapshot doesn't represent. To avoid false positives we only flag keys
  // that look home-page-shaped (the home snapshot reaches them via direct
  // section headers, not nested in other pages).
  // Conservative: skip this check for now; rely on `yarn lint:locales` to
  // catch missing keys in the source side.
  void seen;
};

// === Audit 3: map orphan key / file references ===

const auditMapReferences = async (mapContent: string) => {
  // Cut off at the "## Change log" section — historical entries there
  // legitimately mention keys and files that no longer exist.
  const changeLogIndex = mapContent.search(/\n## Change log\b/i);
  const activeMap =
    changeLogIndex === -1
      ? mapContent
      : mapContent.slice(0, changeLogIndex);

  const allLocaleKeys = new Set<string>([
    ...Object.keys(SOURCES.en),
    ...Object.keys(SOURCES.fr),
  ]);

  // Backtick-wrapped key references that look like locale keys.
  // Matches things like `summary-content`, `case-study-01-title`, etc.
  const keyRefPattern =
    /`([a-z][a-z0-9_-]*(?:-(?:title|subtitle|content|intro|outro|href))|(?:summary|approach|guardrails|projects|contact|design_systems|case_study|tnb_case_study|case_studies_outro))`/g;

  const seenKeys = new Set<string>();
  for (const match of activeMap.matchAll(keyRefPattern)) {
    const key = match[1];
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    if (!allLocaleKeys.has(key)) {
      record({
        kind: 'map-stale-key',
        key,
        detail: `map references locale key '${key}' that no longer exists in source`,
      });
    }
  }

  // Markdown filename references.
  const fileRefPattern = /`((?:en|fr)-home-[a-z0-9_]+\.md)`/g;
  const fsFiles = new Set(await fs.readdir(MARKDOWN_DIR));
  const seenFiles = new Set<string>();
  for (const match of activeMap.matchAll(fileRefPattern)) {
    const filename = match[1];
    if (seenFiles.has(filename)) continue;
    seenFiles.add(filename);
    if (!fsFiles.has(filename)) {
      record({
        kind: 'map-stale-file',
        detail: `map references markdown file '${filename}' that no longer exists on disk`,
      });
    }
  }
};

// === Main ===

const main = async () => {
  const { messages } = await readMarkdownFiles();
  const markdownByLocale: Record<Locale, Record<string, string>> = {
    en: messages.en ?? {},
    fr: messages.fr ?? {},
  };

  for (const locale of LOCALES) {
    const snapshot = await fs.readFile(SNAPSHOT_PATHS[locale], 'utf8');
    auditTitlesAndSubtitles(locale, snapshot);
    auditBodyDrift(locale, snapshot, markdownByLocale[locale]);
  }

  const mapContent = await fs.readFile(MAP_PATH, 'utf8');
  await auditMapReferences(mapContent);

  if (issues.length === 0) {
    console.log('✅ snapshot drift audit clean');
    return;
  }

  console.log(
    `⚠ snapshot drift audit found ${issues.length} issue(s):\n`,
  );
  for (const issue of issues) {
    const localePrefix = issue.locale ? `[${issue.locale}] ` : '';
    const keyPrefix = issue.key ? `[${issue.key}] ` : '';
    console.log(
      `  ${issue.kind}: ${localePrefix}${keyPrefix}${issue.detail}`,
    );
  }
  process.exit(1);
};

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
