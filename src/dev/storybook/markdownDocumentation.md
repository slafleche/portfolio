# Markdown component: example + documentation

`Markdown.tsx` is a flexible component that supports standard Markdown plus
opt-in customizations (shortcodes, `data-*` attributes, and `data-ui` flags) to
keep localized content easy to translate, maintain, and tweak.

## Paragraphs + basic styling

Plain paragraph with **bold**, _italic_, and ~~strikethrough~~, plus
`inline code`.

Another paragraph to ensure multiple blocks render correctly, with an inline
link to [Storybook home](/).

## Lists

Unordered list:

- Item A
- Item B
  - Nested item B.1
  - Nested item B.2 with `inline code`
- Item C

## Code blocks

Fenced code block with language:

```ts
export function hello(name: string) {
  return `Hello, ${name}`;
}
```

Fenced code block without language:

```
No language here — just a code block.
```

## Image

![Hero heading SVG](/svgs/en-heroHeading-gen.svg 'Hero heading (EN)')

## Horizontal rule

---

## Inline HTML (allowed: `span`) + data attributes

Only `span` is allowed for inline HTML. It can carry `data-*` attributes:

<span data-demo="inline-span" data-note="data-* attrs are preserved">Inline span
contents can include **bold** and _italic_.</span>

It can also “reparse” inline markdown when the inner text includes `[element:`
or `[br`:

<span data-demo="inline-reparse">Line one[br]Line two[br|2]Line three</span>

## HTML `<abbr>` + `<dfn>` (special-cased)

Abbreviation via HTML (must use `<abbr title="...">` + closing `</abbr>`):

<abbr title="Application Programming Interface">API</abbr>

Definition via HTML (must use `<dfn title="...">` + closing `</dfn>`):

<dfn title="A short definition shown as a tooltip">defined term</dfn>

## Heading data attributes prefix (for `data-*`)

The Markdown component supports a heading text prefix that looks like:
`[data-foo="bar" data-ui="heading"] Your heading text`

Note: `data-ui="heading"` opts the heading _out_ of default typography styles
(see `src/styles/typography.css.ts`).

### [data-demo="heading-prefix" data-ui="heading"] H3 with data attrs + `data-ui`

## Shortcodes

### `[br]` (inline)

This uses `[br]` and `[br|N]`:

Line one[br]Line two[br|3]Line three

### `[element:...]` (inline)

GitHub wordmark:

[element:GitHubWordmark]

GitHub wordmark variants:

- Default (site/en): [element:GitHubWordmark]
- CSS Calipers target: [element:GitHubWordmark|csscalipers-en]
- French locale: [element:GitHubWordmark|site-fr]

NPM wordmark:

[element:NPMWordmark]

NPM wordmark variant:

[element:NPMWordmark|fr]

### `[ExampleSites|…]` (block with locale aria/title for oracle)

[ExampleSites|en]

[ExampleSites|fr]

### `[MockCode|…] ... [/MockCode]` (block)

[MockCode|ts] MockCode can contain markdown, but it’s rendered via
`MockCodeBlock` with its own `asUi` config. // Heading

## Title

Normal paragraph with a [link](https://example.com) and `inline code`.

- List item
- List item

```ts
console.log('This is nested code inside MockCode');
```

[/MockCode]

## Meta behavior (first/last)

The renderer adds `data-first="true"` and `data-last="true"` onto the first/last
“renderable” top-level tokens (it ignores `space` and `def` tokens).

## Inline markdown (`renderInlineMarkdown`)

Some components use `renderInlineMarkdown(...)` to render short strings (titles,
subtitles, labels) without wrapping them in paragraphs.

Rendered example:

Build **fast**, ship _often_, and share on [element:GitHubWordmark]

Raw string (as it would be passed to `renderInlineMarkdown`):

```txt
Build **fast**, ship *often*, and share on [element:GitHubWordmark]
```

## Split marker (`[split]`)

`[split]` is not a Markdown tokenizer in `src/lib/markdown/`. It’s a locale
string marker parsed by `src/lib/locales/translations/splitShortcodes.ts` to
split a single string into two parts (for example, multi-line hero titles).

Example:

```txt
Stéphane LaFlèche [split] Full-stack Developer
```
