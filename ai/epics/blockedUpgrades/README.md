# Blocked Upgrade Epics

This folder tracks **blocked upgrades**: work we want to do (usually toolchain
or dependency upgrades) but cannot yet start because of clear external
requirements.

Each blocked upgrade epic lives under its own folder here:

- `ai/epics/blockedUpgrades/<upgrade-id>/`
  - `<upgrade-id>_primer.md`
  - `<upgrade-id>_implementation.md`
  - `<upgrade-id>_plan.md`
  - Optional: `<upgrade-id>_notes.md`
  - `<upgrade-id>_requirements.md` — unblock conditions for this upgrade.

The requirements file lists the conditions that must be true before the plan for
that upgrade can be safely executed.

When running in an upgrade-check role (for example, `#upgradable`), agents
should:

- Read each `*_requirements.md`.
- Check which requirements are now satisfied (from local repo state and, when
  allowed, external version checks).
- Mark satisfied requirements as done (`- [x]`) with brief notes.
- Report which upgrades remain blocked vs now unblocked.

This keeps the main epic files focused on _what_ we want to do, while the
`blockedUpgrades` folder tracks _whether we are allowed to start_.
