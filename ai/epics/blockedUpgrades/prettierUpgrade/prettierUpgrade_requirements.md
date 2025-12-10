# Requirements — `prettierUpgrade`

This file tracks the external conditions that must be met before we can safely
move off Prettier `3.6.x` and upgrade the formatting toolchain again.

- [ ] `prettier-plugin-multiline-arrays` release that officially supports the
      target Prettier major/minor (for example, `>=3.7.0`) without custom local
      forks or patches.
- [ ] Prettier core release (and its estree plugin) that formats this repo
      without known crashes on:
      - `app/layout.tsx`
      - `app/page.tsx`
      - `app/[LOCALE]/debug/formelements/*`
      - `tests/contact/ContactFormShell.test.tsx`
      - `tests/styles/colorWrap.helper.test.ts`
- [ ] A small, documented smoke-test script (for example, a `yarn
      format:code:smoke` variant) that runs Prettier against a representative
      subset of the repo and fails loudly if the upgrade regresses formatting
      or reintroduces crashes.

