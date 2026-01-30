A practical overview of the tools I use to design, build, and ship UI, optimized
for maintainability, predictable change, and reviewable output (not "latest for
the sake of it").

Repo is open source: <span data-white-space="no-wrap">[element:GitHubWordmark|site-fr].</span>

## Application

Built with Next.js (App Router) on top of React + TypeScript. It's a solid
baseline for routing, rendering, and performance, while keeping the codebase
strongly typed and easy to refactor.

If you want to verify:
[`next.config.js`](https://github.com/slafleche/portfolio/blob/main/next.config.js)
shows the build wiring (including custom webpack rules and the style pipeline).

## UI system

The design system is token-driven and implemented with vanilla-extract
(sprinkles/recipes), with Radix UI primitives where it makes sense. The goal is
to keep building blocks composable and predictable: consistent spacing,
typography, and color decisions, plus clear escape hatches when a page needs to
diverge.

If you want to verify: see
[`src/styles/`](https://github.com/slafleche/portfolio/tree/main/src/styles) and
the Storybook stories under
[`src/components/stories/`](https://github.com/slafleche/portfolio/tree/main/src/components/stories).

## Content & media

Content is authored in Markdown and rendered via Marked (with custom
shortcodes), with Prism-based syntax highlighting. Video playback uses HLS.js
when needed.

If you want to verify:

- Markdown rendering: [`src/components/Markdown.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/Markdown.tsx)
- Code highlighting: [`src/components/CodeBlock.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/CodeBlock.tsx)
- HLS video: [`src/components/VideoByName.client.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/VideoByName.client.tsx)

## Storybook + visual review

Storybook (Vite) is used as a UI workshop, and Chromatic provides visual diffs
so changes can be reviewed safely.

If you want to verify:
[`.storybook/main.ts`](https://github.com/slafleche/portfolio/blob/main/.storybook/main.ts)
and the stories under
[`src/components/stories/`](https://github.com/slafleche/portfolio/tree/main/src/components/stories).

## Infra

Deployed on Vercel, with a Cloudflare Worker used as a CORS proxy in front of an
R2-backed asset bucket for CDN delivery.

If you want to verify:
[`.cloudflare/cors_worker.js`](https://github.com/slafleche/portfolio/blob/main/.cloudflare/cors_worker.js),
[`.cloudflare/wrangler.toml`](https://github.com/slafleche/portfolio/blob/main/.cloudflare/wrangler.toml),
and [`.cloudflare/readme.md`](https://github.com/slafleche/portfolio/blob/main/.cloudflare/readme.md).

## Code quality guardrails

Beyond ESLint + Prettier, this repo includes a set of custom linting rules that
codify architecture and "design system" constraints: style-layer guardrails,
dependency boundary checks, locale markdown validation, and secret scanning.
This keeps changes reviewable and prevents slow, accidental drift over time.

If you want to verify:

- Lint entry points: [`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
  (`lint:*`, `typecheck`, `verify`)
- Style + architecture rules: [`scripts/checkLintRules.mjs`](https://github.com/slafleche/portfolio/blob/main/scripts/checkLintRules.mjs)
- Secret scanning + runtime config checks (Turnstile/Brevo, etc):
  [`scripts/checkSecretLookout.mjs`](https://github.com/slafleche/portfolio/blob/main/scripts/checkSecretLookout.mjs),
  [`scripts/checkRuntimeConfig.mjs`](https://github.com/slafleche/portfolio/blob/main/scripts/checkRuntimeConfig.mjs)
- Locale markdown validation: [`scripts/checkLocaleMarkdown.ts`](https://github.com/slafleche/portfolio/blob/main/scripts/checkLocaleMarkdown.ts)
- Base ESLint config: [`eslint.config.js`](https://github.com/slafleche/portfolio/blob/main/eslint.config.js)

## Validation and testing

I use Vitest + Testing Library for unit/integration tests (core logic, component
behavior, and edge cases), and Playwright for end-to-end coverage of real flows.

Concrete examples you can check:

- Contact form behavior and failure modes:
  [`tests/contact/`](https://github.com/slafleche/portfolio/tree/main/tests/contact)
  (for example
  [`tests/contact/ContactFormFlow.test.tsx`](https://github.com/slafleche/portfolio/blob/main/tests/contact/ContactFormFlow.test.tsx))
- Responsive behavior utilities:
  [`tests/responsive/`](https://github.com/slafleche/portfolio/tree/main/tests/responsive)
- Server-side verification:
  [`tests/server/`](https://github.com/slafleche/portfolio/tree/main/tests/server)

### Full-page visual regression in Chromatic (custom pipeline)

In addition to component stories, I built a small pipeline that renders full
Next.js pages with Playwright, writes PNGs into `public/pages-renders/`, and
then surfaces those images inside Storybook as "Pages/\*" stories, so Chromatic
can review full-page renders alongside the UI library.

If you want to verify:

- Overview doc: [`visual-regression.md`](https://github.com/slafleche/portfolio/blob/main/visual-regression.md)
- Playwright generator: [`tests/e2e/pages.visual.spec.ts`](https://github.com/slafleche/portfolio/blob/main/tests/e2e/pages.visual.spec.ts)
- Storybook static mapping (`public/pages-renders/` → `/pages`):
  [`public/pages-renders/`](https://github.com/slafleche/portfolio/tree/main/public/pages-renders)
  →
  [`.storybook/main.ts`](https://github.com/slafleche/portfolio/blob/main/.storybook/main.ts)
- Page image stories:
  [`src/components/stories/Page.Home.stories.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/stories/Page.Home.stories.tsx),
  [`src/components/stories/Page.Systems.stories.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/stories/Page.Systems.stories.tsx)

## AI-assisted coding

I use AI assistants as a pair-programming tool to accelerate routine work while
keeping technical decisions and quality standards human-owned. AI helps me move
faster on exploration, drafting, and consistency checks, but I treat all outputs
as drafts requiring verification.

### What I use it for

Technical writing (documentation, PR descriptions), design exploration
(evaluating trade-offs, edge cases, API shapes), scaffolding generation (tests,
utilities, refactor steps), and consistency checks (naming, patterns, missing
cases).

### How I keep it reliable

All changes are validated against types, lint rules, tests, and runtime
behavior. When AI output fails, I treat it like a failing unit test; I add more
constraints through agent instructions, linting rules, or stricter
specifications until it produces reliable results.

I keep changes reviewable: small diffs, repeatable scripts over manual edits. I
don't share secrets or proprietary details in prompts.

### Why it matters

Faster iteration on maintenance-heavy work without compromising quality. Better
documentation and explicit decisions that reduce team overhead. AI works best
when paired with solid architecture, linting, and tests - the kind of environment
I build and work within.

## Pipelines

This repo includes purpose-built pipelines to generate assets, keep localization
in sync, and make "hard to review" UI states easy to validate.

### Localization + rich Markdown pipeline

Locale content is authored in Markdown and compiled into generated TypeScript
maps, with validation to catch missing content and formatting issues. It also
supports rich "shortcodes" (for example abbreviations and custom blocks) so the
same content works in the app and in Storybook.

If you want to verify:

- Markdown compilation: [`scripts/generateLocaleMarkdown.ts`](https://github.com/slafleche/portfolio/blob/main/scripts/generateLocaleMarkdown.ts)
- Locale markdown validation (missing files, formatting rules):
  [`scripts/checkLocaleMarkdown.ts`](https://github.com/slafleche/portfolio/blob/main/scripts/checkLocaleMarkdown.ts)
- Copy HTML generation + missing/extra locale key checks:
  [`scripts/generateCopyHtml.ts`](https://github.com/slafleche/portfolio/blob/main/scripts/generateCopyHtml.ts)
- Shortcodes/extensions:
  [`src/lib/markdown/`](https://github.com/slafleche/portfolio/tree/main/src/lib/markdown)
- Generated outputs:
  [`src/lib/locales/generated/markdown.gen.ts`](https://github.com/slafleche/portfolio/blob/main/src/lib/locales/generated/markdown.gen.ts),
  [`src/lib/locales/generated/html.gen.ts`](https://github.com/slafleche/portfolio/blob/main/src/lib/locales/generated/html.gen.ts)

### Build orchestration

For release flows, a single "generate" entrypoint runs the pipeline in a
repeatable order (locales → favicons → sitemap → CDN assets), so the repo stays
consistent without manual steps.

If you want to verify:
[`scripts/runGenerateAllPipeline.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/runGenerateAllPipeline.mts)
([`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
`generate`).

### Favicons pipeline

Favicons are generated from a token-driven plan, written to `public/favicons/`,
and surfaced via a generated manifest consumed by the app and debug tooling.

If you want to verify:

- Generator: [`scripts/generateFavicons.ts`](https://github.com/slafleche/portfolio/blob/main/scripts/generateFavicons.ts)
- Tokens/plan: [`src/tokens/favicon.tokens`](https://github.com/slafleche/portfolio/blob/main/src/tokens/favicon.tokens)
- Generated manifest: [`src/data/generated/favicons/manifest.favicons.gen.ts`](https://github.com/slafleche/portfolio/blob/main/src/data/generated/favicons/manifest.favicons.gen.ts)
- Preview/debug page: [`app/[LOCALE]/debug/favicons/page.tsx`](https://github.com/slafleche/portfolio/blob/main/app/%5BLOCALE%5D/debug/favicons/page.tsx)

### Sitemap pipeline

The sitemap is generated as a real build artifact (not hand-edited), based on
routes and locales.

If you want to verify:
[`scripts/generateSitemap.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/generateSitemap.mts)
(writes
[`public/sitemap.xml`](https://github.com/slafleche/portfolio/blob/main/public/sitemap.xml)),
[`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
(`generate:sitemap`).

### Custom hero SVG generation

The hero heading artwork is generated and wired into the app as code, so the
rendered output is predictable and can be versioned like any other UI change.

If you want to verify:
[`scripts/buildHeroHeadingSvg.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/buildHeroHeadingSvg.mts)
(script),
[`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
(`build:hero-svg`), and the debug "workbench" page
[`app/[LOCALE]/debug/heroHeadingSvg/page.tsx`](https://github.com/slafleche/portfolio/blob/main/app/%5BLOCALE%5D/debug/heroHeadingSvg/page.tsx).

### Share images generation (custom page → PNGs)

Share images are generated by rendering a dedicated debug page and
screenshotting the exact viewport(s) needed. This keeps output consistent across
locales/sizes and makes it easy to update assets without hand-editing images.

If you want to verify:

- Generator: [`scripts/buildShareImages.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/buildShareImages.mts)
- Source page: [`app/[LOCALE]/debug/shareImage/page.tsx`](https://github.com/slafleche/portfolio/blob/main/app/%5BLOCALE%5D/debug/shareImage/page.tsx)
- Output folder: [`cdn/media/images/localImageSrc/share-images/`](https://github.com/slafleche/portfolio/tree/main/cdn/media/images/localImageSrc/share-images)
- Images pipeline entrypoint: [`scripts/runGenerateImagesPipeline.mjs`](https://github.com/slafleche/portfolio/blob/main/scripts/runGenerateImagesPipeline.mjs)

### Render component markup → reusable assets

For cases where the most reliable artifact is "what the browser renders", there
is a script that renders a React component to static HTML, compiles its
vanilla-extract CSS, and then uses Playwright to generate a PNG asset.

If you want to verify:
[`scripts/mockMarkupToImg.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/mockMarkupToImg.mts)
(script),
[`src/components/MockEndHTML.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/MockEndHTML.tsx)
(component),
[`src/styles/components/mockEndHTML.css.ts`](https://github.com/slafleche/portfolio/blob/main/src/styles/components/mockEndHTML.css.ts)
(styles),
[`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
(`mock:markup-img`).

### SVG formatting and optimization

SVGs are formatted consistently and can be optimized via an SVGO-based pipeline
to keep diffs small and assets efficient.

If you want to verify:
[`scripts/optimizeSvgs.mjs`](https://github.com/slafleche/portfolio/blob/main/scripts/optimizeSvgs.mjs)
(optimizer),
[`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
(`format:svg`, `optimize:svg`).

### CDN assets (fonts / images / videos)

Large static assets are generated locally, separated by environment and version
(`_staging` vs `release`, `v1`/`v2`/…), then synced to Cloudflare R2. Manifests
are rewritten to stable CDN URLs, and a hashes file is produced to make updates
fast and cache-friendly.

This includes custom pipelines for fonts, images, and videos (including video
posters and HLS ladders), plus tooling to sync, delete, and purge CDN caches.

If you want to verify:

- Overview: [`cdn/README.md`](https://github.com/slafleche/portfolio/blob/main/cdn/README.md)
- Versions by env/kind: [`cdn/assetGroupVersions.json`](https://github.com/slafleche/portfolio/blob/main/cdn/assetGroupVersions.json)
- CDN sync + manifest rewriting + hashing: [`cdn/cdnSyncManifests.mts`](https://github.com/slafleche/portfolio/blob/main/cdn/cdnSyncManifests.mts)
- Cache purge tooling: [`cdn/cdnPurgeCache.mts`](https://github.com/slafleche/portfolio/blob/main/cdn/cdnPurgeCache.mts)
- CDN client ops (list/delete): [`cdn/cdnClient.mts`](https://github.com/slafleche/portfolio/blob/main/cdn/cdnClient.mts)
- CDN scripts: [`cdn/package.json`](https://github.com/slafleche/portfolio/blob/main/cdn/package.json)
- Orchestrator: [`scripts/runGenerateAllPipeline.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/runGenerateAllPipeline.mts)
- Font smoke tests:
  [`scripts/testFonts.mts`](https://github.com/slafleche/portfolio/blob/main/scripts/testFonts.mts)
  ([`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
  `test:fonts`)

### Cloudflare CORS proxy (Wrangler)

There is a small Cloudflare Worker that acts as a CORS shim/proxy in front of a
target origin, with an explicit allow-list of origins. It's deployed with
Wrangler and versioned as infrastructure code.

If you want to verify:
[`.cloudflare/cors_worker.js`](https://github.com/slafleche/portfolio/blob/main/.cloudflare/cors_worker.js),
[`.cloudflare/wrangler.toml`](https://github.com/slafleche/portfolio/blob/main/.cloudflare/wrangler.toml),
and [`.cloudflare/readme.md`](https://github.com/slafleche/portfolio/blob/main/.cloudflare/readme.md).

### "Scenarios" for hard-to-style UI states

Some UI states are hard to catch by hand (for example, the contact form loading
state that only appears briefly). This repo includes a "scenario" system that
forces specific form states for development and review.

If you want to verify:

- Scenario definitions: [`src/dev/scenarios/contactForm.scenarios.ts`](https://github.com/slafleche/portfolio/blob/main/src/dev/scenarios/contactForm.scenarios.ts)
- Scenario runner:
  [`scripts/devScenarios.ts`](https://github.com/slafleche/portfolio/blob/main/scripts/devScenarios.ts)
  (see
  [`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json)
  `scenarios:*`)
- Scenario wiring in the form: [`src/components/contact/ContactForm.tsx`](https://github.com/slafleche/portfolio/blob/main/src/components/contact/ContactForm.tsx)
- Scenario tests: [`tests/contact/ContactForm.scenarios.test.tsx`](https://github.com/slafleche/portfolio/blob/main/tests/contact/ContactForm.scenarios.test.tsx)

### Brevo + contact form test harness

Contact form delivery is tested against a mocked Brevo client, with a small test
harness to control runtime env/config consistently across unit tests.

If you want to verify:

- Brevo delivery tests: [`tests/server/deliverContactMessage.test.ts`](https://github.com/slafleche/portfolio/blob/main/tests/server/deliverContactMessage.test.ts)
- Test command: [`package.json`](https://github.com/slafleche/portfolio/blob/main/package.json) (`test:brevo`)
- Env harness helpers:
  [`tests/helpers/runtimeEnvHarness.ts`](https://github.com/slafleche/portfolio/blob/main/tests/helpers/runtimeEnvHarness.ts),
  [`tests/helpers/testEnvVars.ts`](https://github.com/slafleche/portfolio/blob/main/tests/helpers/testEnvVars.ts)
