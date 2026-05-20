---
name: markdown-shortcodes
description: >-
  Reference for the custom shortcodes available inside the portfolio's locale
  copy. Two families: (1) markdown extensions that work in
  `src/lib/locales/translations/markdown/*-home-*.md` body content, and (2)
  locale-string shortcodes that work in section titles and subtitles inside
  `en.data.ts` / `fr.data.ts` / `caseStudies/*.ts`. Triggers on phrases like
  "what shortcodes do we have", "shortcode reference", "list shortcodes",
  "add a [br] / [abbr] / [wordmark] / [split]", "how do I insert X in
  markdown".
---

# markdown-shortcodes

The portfolio has two distinct shortcode systems. They look the same
(`[name]` in square brackets) but live in different layers and have
different rules.

## Family A — markdown extensions (work in body markdown)

These are `marked` extensions registered for parsing the markdown files
under `src/lib/locales/translations/markdown/`. They render only inside
markdown body content fed through the locale pipeline. They do NOT work
inside `en.data.ts` / `fr.data.ts` string values.

### `[abbr:TERM]` — inline

Renders an `<abbr>` element with tooltip + accessible expansion. The
term's full text is looked up in the locale's abbreviation table.

- Example: `[abbr:R&D]`, `[abbr:CSS]`, `[abbr:WCAG]`.
- Definitions: `src/lib/locales/translations/abbreviations/en.abbr.ts`
  and `fr.abbr.ts`. A term must be defined there before it can be
  used in markdown.
- Source: `src/lib/markdown/abbrShortcode.ts`.

### `[br]` or `[br|N]` — inline

Inserts N `<br>` tags. Default count is 1.

- Example: `[br]` (one line break), `[br|3]` (three line breaks).
- N must be a positive integer.
- Source: `src/lib/markdown/brShortcode.ts`.
- Use for breathing room inside a markdown body, not for section
  spacing (section spacing belongs in CSS, not markdown).

### `[element:NAME]` or `[element:NAME|VARIANT]` — inline

Inserts a custom inline HTML element by name, optionally with a
variant. Used for decorative spans, dividers, etc.

- Example: `[element:divider]`, `[element:divider|thin]`.
- Source: `src/lib/markdown/elementShortcode.ts`. The element name +
  variant must be a recognized one (check the renderer for the current
  whitelist).

### `[ExampleSites|LOCALE]` — block

Renders the rotating "examples in the wild" component (a strip of
client-site links). Used in the Vanilla case study intro.

- Example: `[ExampleSites|en]`, `[ExampleSites|fr]`.
- Must be on its own line.
- Source: `src/lib/markdown/exampleSitesShortcode.ts`.
- Component: `src/components/ExampleSites.tsx`.

### `[MockCode|LANG] ... [/MockCode]` — block

Renders a styled mock code block with the specified language label.
Multi-line, opening tag on its own line, closing tag on its own line.

- Example:
  ```
  [MockCode|tsx]
  const x = 1;
  [/MockCode]
  ```
- Source: `src/lib/markdown/mockCodeShortcode.ts`.

---

## Family B — locale-string shortcodes (work in `.ts` string values)

These work inside locale STRING values in `en.data.ts`, `fr.data.ts`,
and `caseStudies/*.ts` (anywhere a title / subtitle / label is defined
as a plain string). They are parsed by dedicated component-side helpers,
not by the markdown engine. They do NOT work inside markdown body files.

### `[split]` — SVG heading + hero-subtitle line break

Marker for two-line layout in hero titles, hero subtitles, and SVG
heading rendering. Splits the string at this marker.

- Example: `'Full-stack developer [split] End-to-end design systems for AI-era teams'`.
- Used in: `hero-title`, `hero-subtitle`, `systems-hero-title`,
  `systems-hero-subtitle`. Not elsewhere.
- Handler: `src/lib/locales/translations/splitShortcodes.ts` (parser);
  `src/styles/helpers/textSplit.ts` (CSS helper).
- **Do NOT use `[split]` in markdown body files or in cover letters /
  CVs under `cv_stuff/` — it only renders inside portfolio hero
  contexts. Anywhere else it appears literally as `[split]`.**

### `[wordmark:NAME]` — branded SVG inside a title

Replaces the matched name with a branded SVG wordmark, used inside
section title strings.

- Example: `'[wordmark:Vanilla] Case Study'`,
  `'[wordmark:Coca-Cola]'`, `'Mon travail chez [wordmark:TNB]'`.
- Used in: case-study titles, project titles.
- Component: `src/components/WordmarkInTitle.tsx` (parser); per-brand
  SVGs in `src/components/wordmarks/*.tsx`.
- Mapping (name → SVG): `src/components/wordmarks/wordmarks.tsx`. New
  wordmarks need both a `.tsx` SVG file and a mapping entry.
- The name inside the brackets must match exactly (case-sensitive)
  what `parseWordmarkTemplate` looks up.

---

## Where to look first

| Goal | Family | Shortcode | File to edit |
|---|---|---|---|
| Add a line break inside a paragraph | A | `[br]` | the `.md` file |
| Define + use an abbreviation tooltip | A | `[abbr:X]` | abbreviation table + `.md` |
| Surface a client / brand logo in a section title | B | `[wordmark:X]` | `en.data.ts` / case-study `.ts` |
| Split a hero title onto two lines | B | `[split]` | `en.data.ts` `hero-*` key |
| Embed a code mock | A | `[MockCode|...]` | the `.md` file |
| Embed the "examples in the wild" strip | A | `[ExampleSites|en]` | the `.md` file |
| Decorative inline element | A | `[element:NAME]` | the `.md` file |

## What this skill does NOT do

- Does NOT cover global site copy conventions (em-dash rule, semicolon
  rule, etc.) — those live in `~/.claude/CLAUDE.md` and
  `cv_stuff/.claude/CLAUDE.md`.
- Does NOT cover CV / cover-letter shortcodes under `cv_stuff/` — that
  pipeline (Pandoc-based PDF rendering) does NOT support these
  portfolio shortcodes. Don't use `[split]` / `[wordmark:X]` in cover
  letters — they'll render as literal text.
- Does NOT cover SVG heading generation — see `scripts/buildHeroHeadingSvg.mts`.
