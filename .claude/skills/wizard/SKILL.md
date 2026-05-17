---
name: wizard
description: Use when the user requests step-by-step, item-by-item approvals for a known list of changes (files, sections, tasks, copy strings). Triggers on phrases like "#wizard", "one at a time", "let's go step by step", "walk me through", or when introducing/changing user-visible text and you need to agree on copy before wiring it. Handle one item per turn, propose a draft, wait for explicit approval before moving on.
---

# Wizard

Work through a list one item at a time, like an installation wizard, so each
step is reviewed and approved before the next.

## Core rules

- Work on one item at a time from the agreed list (files, sections, tasks,
  copy strings). Do not batch.
- For each item, first propose a draft (plan / text / change) and wait for
  explicit approval before applying it or moving on.
- Rework the current item as needed until the user clearly approves it
  ("looks good", "green light", "next").
- Only proceed to the next item after explicit approval of the current one.
- Keep track of position in the list so both sides know which item is in
  focus (e.g. "Item 3 of 7: ...").
- End the run with a concise summary or final artifact (updated TODO file,
  list of agreed tasks).

## Copy wizard (user-visible text)

When introducing or changing copy on the site:

1. **Agree on the exact wording first** — in plain language, no code changes.
2. **Decide placement** — which section builder under
   `src/lib/locales/sections/`, and whether the new key should be plain
   string, markdown, or shortcode-backed.
3. **Wire it last** — once copy and placement are approved, design specific
   locale keys, update the section builder + translations, then thread the
   new fields through component props.

Don't hard-code new strings or call translators directly in components or
tests.
