# Module: wizard

## Purpose

Handle a list of items step-by-step, like an installation wizard, so work is reviewed and approved at each stage instead of being applied all at once.

## Key points

- Must: Work on one item at a time from the agreed list (files, sections, tasks, etc.); do not batch items together.
- Must: For each item, first propose a draft (plan/text/change) and wait for explicit approval before applying it or moving to the next item.
- Must: Rework the current item as needed until the user clearly approves it (for example, “looks good” or “green light”).
- Must: Only proceed to the next item after explicit approval of the current one.
- Should: Keep track of the current position in the list so both sides know which item is in focus.
- Should: End with a concise summary or final artifact for the whole run (for example, an updated TODO file or a list of agreed tasks).

## Copy wizard

- Must: When introducing or changing user-visible text, first discuss and agree on the exact copy in plain language (no code changes yet).
- Must: Decide where the text belongs (for example, which section builder under `src/lib/locales/sections`, and whether it should be plain string, markdown, or shortcode-backed) before adding keys or wiring.
- Must: After copy and placement are approved, design specific locale keys, update the appropriate section builder and translations, then thread the new fields through component props; do not hard-code new strings or call translators directly in components or tests.

