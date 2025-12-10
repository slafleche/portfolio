# Implementation — `prettierUpgrade`

This file will capture the concrete strategy once the upgrade is unblocked.

For now, the epic is **blocked**; see
`ai/epics/blockedUpgrades/prettierUpgrade/prettierUpgrade_requirements.md` for
the current requirements to unblock.

High-level approach (to be refined when unblocked):

- Identify the target Prettier + plugin versions we intend to use.
- Run focused format + lint smoke tests on:
  - Core app routes/layouts.
  - Contact form stack and tests.
  - Style helpers and typography tests.
- Document any required configuration changes (for example, plugin ordering,
  parser overrides) needed to keep behaviour consistent.
