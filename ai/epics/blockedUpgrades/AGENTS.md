# Agent Instructions for `ai/epics/blockedUpgrades`

This subtree tracks **blocked upgrade epics**: work we want to do (for example,
toolchain/library upgrades) but cannot start yet because of explicit external
requirements.

Each blocked upgrade is a normal epic folder under this directory:

- `ai/epics/blockedUpgrades/<epic-id>/`
  - `<epic-id>_primer.md`
  - `<epic-id>_implementation.md`
  - `<epic-id>_plan.md`
  - Optional: `<epic-id>_notes.md`
  - `<epic-id>_requirements.md` — the upgrade's unblock conditions.

## File patterns

- Must: Keep requirements files co-located with their epic:
  - `ai/epics/blockedUpgrades/<epic-id>/<epic-id>_requirements.md`
  - Example: `ai/epics/blockedUpgrades/prettierUpgrade/prettierUpgrade_requirements.md`
- Each requirements file documents **only** the conditions that must be met
  before the upgrade epic can move from “blocked” into active implementation.

## Requirements files

- Must: Represent requirements as Markdown task items using `- [ ]` / `- [x]`,
  one requirement per line.
- Should: Keep each requirement granular and externally checkable, for example:
  - “`prettier-plugin-multiline-arrays` release supports Prettier `>=3.7`.”
  - “Known Prettier estree crashes are fixed for `app/layout.tsx` and
    `tests/contact/ContactFormShell.test.tsx`.”
- May: Add short explanatory context under each task (indented bullets), but do
  not hide new requirements only in prose.

## `#upgradable` behavior

- When the user activates an upgrade-check role (for example, with `#upgradable`
  in chat):
  - Enumerate all `*_requirements.md` files under `ai/epics/blockedUpgrades/`
    (for example, using folder and filename patterns).
  - For each requirements file:
    - Read the open `- [ ]` tasks.
    - For each task, decide whether it can be checked using:
      - Local repo state (for example, `package.json`, lockfile, config).
      - External lookups (for example, library versions) *only* when allowed by
        sandbox/approval rules.
    - When a requirement is clearly satisfied, update that line to `- [x]` and
      (optionally) add a brief note with what changed (for example, “Satisfied
      by `prettier-plugin-multiline-arrays@4.2.0`.”).
  - Summarise back to the user which upgrade epics are:
    - Still blocked (open requirements remain), and
    - Unblocked (all requirements checked).
- Must: Do **not** silently modify epic primers/plans when requirements flip to
  “unblocked”. Instead, surface that the epic (for example, `prettierUpgrade`)
  is ready to be planned or implemented so the user can prioritise it.
