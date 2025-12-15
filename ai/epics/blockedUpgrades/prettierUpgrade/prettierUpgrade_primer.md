# Primer — `prettierUpgrade` (Prettier toolchain)

## Problem

The formatting toolchain is currently pinned to Prettier `3.6.x` so that
`prettier-plugin-multiline-arrays@4.0.5` and the broader plugin stack operate
within their documented support window. Attempts to move to newer Prettier
releases exposed crashes inside Prettier's own estree plugin when run against
otherwise normal TS/TSX files in this repo.

Without a clear upgrade path, we cannot safely adopt newer Prettier features or
bug fixes without risking formatter instability.

## Goals

- Restore a **boring, reliable** formatting pipeline that:
  - Uses a supported Prettier + plugin combination.
  - Formats the entire repo (or a clearly defined subset) without crashes.
- Define explicit, checkable requirements for upgrading Prettier, so that:
  - We know _why_ the upgrade is blocked (for example, missing plugin support).
  - We can periodically re-check those requirements and unblock the epic when
    upstream libraries catch up.
- Keep the multiline array behaviour we rely on (for example,
  `multilineArraysWrapThreshold: 0`, `multilineArraysLinePattern: '1'`) across
  the upgrade.

## Non-goals

- Redesigning the project's code style or print width beyond changes required by
  the Prettier upgrade itself.
- Replacing Prettier with a different formatter.

## Link to blocked-upgrade requirements

- See `ai/epics/blockedUpgrades/prettierUpgrade/prettierUpgrade_requirements.md`
  for the concrete conditions that must be satisfied before we attempt the
  upgrade implementation and plan.

## Security note

- `npm audit` currently reports a moderate vulnerability in `fast-xml-parser`
  pulled in by `prettier-plugin-xml`, with "No fix available" for the versions
  in this repo.
- This affects only the formatting toolchain (dev-time), not the built app.
- When revisiting the Prettier stack for this epic, either upgrade to a
  `prettier-plugin-xml` version that depends on a fixed `fast-xml-parser`, or
  decide to drop `prettier-plugin-xml` if XML formatting is no longer needed.
