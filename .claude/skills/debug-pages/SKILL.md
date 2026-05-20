---
name: debug-pages
description: >-
  Use when creating, renaming, or removing a debug preview under
  `app/[LOCALE]/debug/*`. Triggers on phrases like "new debug page", "add a
  debug preview", "debug sandbox", or any task that lands a new directory
  under `app/[LOCALE]/debug/`. Reminds you to register the route in
  `src/data/debugRoutes.json` so it shows up in the dev banner printed by
  `scripts/devWithDebug.mjs` on startup, and points out the optional API
  route + defaults JSON pattern.
---

# debug-pages

The dev script (`scripts/devWithDebug.mjs`) prints a banner on startup:

```
info  - Debug routes (local):
         /en/debug/favicons  http://localhost:3000/en/debug/favicons
         /en/debug/formelements  http://localhost:3000/en/debug/formelements
         ...
```

That list is sourced from `src/data/debugRoutes.json`, not from the
filesystem. A new debug page under `app/[LOCALE]/debug/<name>/page.tsx`
will NOT appear in the banner unless you also add `<name>` to
`debugRoutes.json` under `pages`.

## When to apply

Trigger this skill whenever you (or the user) are:

- Creating a new directory under `app/[LOCALE]/debug/`.
- Renaming an existing debug page directory.
- Deleting a debug page directory.

## Checklist for a new debug page

1. **Create the route** at `app/[LOCALE]/debug/<name>/page.tsx`.
2. **Register the route** by adding `"<name>"` to the `pages` array in
   `src/data/debugRoutes.json`. Keep the order matching how you want the
   banner to read.
3. **Component lives under** `src/components/debug/<Name>Debug.tsx`. Mark
   it `'use client'` if it has interactive state. Treat it as disposable —
   keep styling and logic self-contained; don't share helpers with
   production modules. See the root `CLAUDE.md` "Debug sandboxes" section.
4. **Optional defaults round-trip** — if the page needs user-tweakable
   state persisted between reloads, follow the projectorPath pattern:
   - Defaults JSON lives at either
     `app/[LOCALE]/debug/<name>/<name>.defaults.json` (committed) or
     `/tmp/<name>.json` (throwaway).
   - Add a GET/POST handler at `app/api/debug/<name>/route.ts` that is
     guarded by `isDev()` from `@/lib/runtimeEnv`.
   - The page (server component) reads the JSON at request time and
     passes `initialDefaults` to the client component.

## Renames and deletes

- **Rename**: update the entry in `debugRoutes.json` to match the new
  directory name. If you forget, the banner will link to a 404.
- **Delete**: remove the entry from `debugRoutes.json` so the banner
  stops advertising a route that no longer exists.

## What this skill does NOT do

- Does NOT modify production routes or layouts.
- Does NOT enforce a styling convention beyond what `CLAUDE.md` already
  says about debug sandboxes (self-contained, deletable, never shared
  into prod).
- Does NOT auto-create the API route or defaults JSON — those are
  optional and only needed if the page persists state.
