# helperAPI Epic — Implementation Notes (`#architect`)

> Draft notes only — no task breakdown yet. This file captures the technical
> shape of the helper defaults API so that `#pm` can later turn it into
> concrete slices.

## 1. Surfaces and ownership

### 1.1. Spacing helpers

- Core functions:
  - `spacing(input?: SpacingInput): string` (internal, used by helpers).
  - `paddings(input?: SpacingInput) => { padding: string }`.
  - `margins(input?: SpacingInput) => { margin: string }`.
- Types:
  - `AxisValues<T>` with `all`, `vertical`, `horizontal`, and explicit `top`/`right`/`bottom`/`left`.
  - `SpacingValue = IMeasurement | SpacingKeyword`.
- Default behavior:
  - Current implicit default is effectively “all 0”, with keyword passthrough.
  - Helpers do not currently expose a “this is my default config” API; they only expose behavior via `spacing(...)`.

Ownership principle:

- Spacing helpers define *how* axis shorthands are interpreted and what the fallback behavior is when fields are missing.
- Tokens define *what* spacings are used in specific contexts; helpers should not know about app-specific sizes.

### 1.2. Border helpers

- Core function:
  - `borders(intent?: BorderInput, options?: BorderOptions): FinalBorderCSS`.
- Types:
  - `BorderIntent extends AxisValues<EdgeSpec>` with optional `radius`.
  - `BorderLike` / `IBorder` which allow width/color/style/radius.
- Defaults:
  - Width and radius fallback to values derived from `borderVars` (tokens).
  - Style falls back to a default (e.g., `'solid'`).
  - Color falls back to `colorVars.border`.
- Existing public patterns:
  - Top-level width/color/style for “all edges the same”.
  - Axis-based helpers: `.none()`, `.top()`, `.vertical()`, `.all()`.

Ownership principle:

- Borders helper owns the semantics of “default border” (width/style/color, radius-only behavior).
- Tokens provide the actual numbers/colors; helpers must remain usable with different token sets.

## 2. Default reporting API (read-only for now)

### 2.1. Spacing defaults API

Goal:

- Provide a small introspection surface for tools (and future configs) to ask what the spacing helpers consider their default behavior, without binding to app-specific tokens.

Shape sketch:

- New, pure functions in `spacing.helper.ts` (or a sibling module) such as:
  - `getSpacingDefaults(): SpacingProps`
    - Returns an object describing the helper’s implicit default, e.g. `{ all: m(0) }` or an equivalent zero intent.
  - Optional: `getAxisDefaults(): { all: 'all'; vertical: 'vertical'; horizontal: 'horizontal' }` purely for reflection/metadata.

Constraints:

- Must not reach into tokens; this is purely about helper semantics.
- Should be simple enough that external tools can safely import and use this from Node (lint scripts) without dragging in React or styles.

### 2.2. Border defaults API

Goal:

- Offer an explicit, serializable view of what `borders` treats as its default:
  - Base width / style / color for “all edges” cases.
  - Default radius behavior (e.g., what happens when no radius is configured).

Shape sketch:

- New function in `borders.helper.ts` or a nearby module:
  - `getBorderDefaults(): { width: BorderWidthConfig; style: CSS_TYPES.Property.BorderStyle; color: string; radius?: BorderRadiusConfig }`
    - Uses `borderVars` and `colorVars` under the hood to compute the effective default state.
    - Returns plain data (strings/measurements), not `CssLike`.

Constraints:

- Must remain usable from a Node context (lint script), so avoid importing anything that requires DOM/React.
- Should be robust to future token changes: it reads from tokens but doesn’t dictate how they are defined.

## 3. Preparing for overridable configs (future)

Even though we’re not implementing config injection yet, the design should keep these options open:

- Helper factories:
  - `createSpacingHelpers(config): { spacing, paddings, margins }`
  - `createBorderHelpers(config): { borders }`
  - Current default exports would just be `create*Helpers(defaultConfig)`, wired to project tokens.

- Central config object:
  - A future `helpers.config.ts` could hold app-level overrides:
    - e.g., `borderDefaults` / `spacingDefaults`.
  - Helpers would read from that instead of hard-coded vars, while the default-reporting API would expose the effective values.

For this epic, these ideas stay in the notes; we only make sure the new default-reporting APIs won’t *block* them.

## 4. Interaction with lint / tooling (later epic)

- Lint script (`scripts/checkLintRules.mjs`) can eventually:
  - Import the default-reporting APIs (or a small mirrored module).
  - In non-token files, flag:
    - Obvious no-op overrides where a helper call re-specifies the exact default configuration.
    - Anti-patterns like duplicating symmetric edges instead of using `vertical` / `horizontal`, where detectable.
  - Leave `src/tokens/**` exempt so they can define, restate, or experiment with defaults.

- Measurement alias rules stay as-is, but can reference the new API when crafting messages (“this matches the default border width; move it into tokens or drop it”).

## 5. Risks and open questions

- Where to draw the “library boundary”:
  - If/when helpers become a separate package, some token imports (e.g., `borderVars`, `colorVars`) need to move to a thin adapter layer.
  - The default-reporting API should live in the helper package; project-specific defaults live in the adapter/tokens.

- Complexity vs clarity:
  - There’s a risk of over-engineering configuration too early.
  - The epic should stay focused on making defaults explicit and introspectable; configuration comes in a later, dedicated epic once we see actual multi-project usage.

