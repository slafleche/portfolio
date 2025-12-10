# Plan — `prettierUpgrade`

This plan is intentionally minimal until the epic is unblocked. Tasks should
only be executed once all requirements in
`ai/epics/blockedUpgrades/prettierUpgrade/prettierUpgrade_requirements.md` are
 satisfied.

- [ ] Confirm `prettier-plugin-multiline-arrays` and other Prettier plugins
      support the target Prettier version.
- [ ] Trial the new Prettier + plugin stack on a branch, running:
      - `yarn format:code`
      - `yarn lint`
      - Targeted tests around formatting-sensitive areas.
- [ ] Capture any behaviour changes (especially around arrays, JSX, and
      comments) and decide whether they are acceptable or need config tweaks.
- [ ] Update docs (for example, `README.md` or relevant epic notes) to record
      the final Prettier version, plugin versions, and any known caveats.
