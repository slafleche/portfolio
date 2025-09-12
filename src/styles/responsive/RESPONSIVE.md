# Responsive System – Media Queries

This doc summarizes the **public API** we built for media queries. Naming
follows your keys: _fullSize / compact / compressed_. The sizes are not picked
based on device but rather from the **design**.

## All queries are **px-based**.

## Import surface

**Primary (what most components should use):**

```ts
import {
	// hooks
	useIsFullSize,
	useIsCompact,
	useIsCompressed,
	useMedia,

	// components
	FullSizeOnly,
	CompactOnly,
	CompressedOnly,

	// client-only predicates
	isFullSizeClient,
	isCompactClient,
	isCompressedClient,

	// normalized query strings
	mqStrings,
} from '@/responsive';
```

**Advanced primitives (optional):**

```ts
import {
	useMediaQuery,
	useMediaFromMap,
	makeClientFns,
	MatchMedia,
	toQueryString,
	queriesToStrings,
} from '@/responsive/mediaFactory';
```

---

## Hooks

- `useIsFullSize(): boolean | undefined`
- `useIsCompact(): boolean | undefined`
- `useIsCompressed(): boolean | undefined`

> **SSR-safe**: on the server these return `undefined` (no \`matchMedia\`). On
> the client they return \`true\`/\`false\` and update on viewport changes.

- `useMedia(): { fullSize?: boolean; compact?: boolean; compressed?: boolean }`  
  Aggregate
  hook when you need multiple flags at once.

---

## Components

- `<FullSizeOnly>…</FullSizeOnly>`
- `<CompactOnly>…</CompactOnly>`
- `<CompressedOnly>…</CompressedOnly>`

> Render children only when the corresponding query matches.  
> Return `null` during SSR to avoid hydration mismatches.

- Generic wrapper (advanced):  
  `<MatchMedia query={mqStrings.fullSize}>…</MatchMedia>`

---

## ResponsiveProvider (optional)

Wraps the app and exposes the current responsive state via context.

**Why:** Centralize `matchMedia` listeners and read the current mode anywhere
without repeating hook calls. Useful for badges, analytics, or feature flags.

**API:**

- `useResponsive() → { fullSize?: boolean; compact?: boolean; compressed?: boolean; mode: 'fullSize' | 'compact' | 'compressed' | undefined }`

**Notes:**

- SSR-safe: values are `undefined` on the server; context updates after
  hydration.
- Updates occur only when crossing breakpoints (not on every resize tick).
- If you only need media in 1–2 places, you can skip the provider and use the
  hooks directly.

## Client-only predicates

- `isFullSizeClient(): boolean`
- `isCompactClient(): boolean`
- `isCompressedClient(): boolean`

> For **event handlers/effects** only. Don’t call these during SSR render.

### Do / Don’t

**Do:**

- Call inside **event handlers** (clicks, submits, keydowns).
- Use inside **`useEffect`** after mount for one-off checks.
- Use in **imperative utilities** that only run on the client.

**Don’t:**

- Don’t call during **SSR render**.
- Don’t decide the **initial render tree** with these (use hooks instead).
- Don’t call in the **render body** of components.

```tsx
// ✅ Do (event handler)
const onClick = () => {
	const url = isFullSizeClient() ? '/img/hero@2x.jpg' : '/img/hero@1x.jpg';
	download(url);
};

// ❌ Don’t (render-time branching)
const isDesktop = isFullSizeClient(); // returns false on server
return isDesktop ? <DesktopLayout /> : <MobileLayout />;

// ✅ Use hook for render-time branching
const isDesktop2 = useIsFullSize();
if (isDesktop2 === undefined) return null;
return isDesktop2 ? <DesktopLayout /> : <MobileLayout />;
```

---

## Query strings

- `mqStrings` → normalized string map, e.g.  
  `{ fullSize: "screen and (min-width: 1280px)", compact: "...", compressed: "..." }`.

---

## Configuration

**\`styles/responsive/mediaQueries.ts\`**

- Default export: your px-based queries object shaped like:

```ts
export interface IMediaQueryProps {
	type?: 'all' | 'print' | 'screen';
	minWidth?: string; // e.g. '1280px'
	maxWidth?: string; // e.g. '1279px'
}

// Example keys (your file provides these):
// fullSize, compact, compressed
```

This is the single source of truth consumed by `@/responsive`.

---

## Usage examples

**1) Hook-based branching**

```tsx
const isFull = useIsFullSize();
if (isFull === undefined) return null; // SSR placeholder if needed
return isFull ? <ThreeColLayout /> : <SingleColLayout />;
```

**2) “Only” components**

```tsx
<FullSizeOnly>
	<DesktopNav />
</FullSizeOnly>
```

**3) Aggregate**

```tsx
const { fullSize, compact } = useMedia();
```

**4) Client-only predicate**

```ts
if (isCompressedClient()) openMobileSheet();
```

---

## SSR notes

- Hooks return `undefined` on the server; “Only” components render `null` on the
  server.
- To avoid layout shifts, render a neutral placeholder while awaiting client
  hydration if you conditionally render **different trees**.

---

That’s the full surface area. Keep queries authoritative in
\`styles/responsive/mediaQueries.ts\` and import from \`@/responsive\`
elsewhere.
