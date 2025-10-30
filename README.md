# Portfolio site for slafleche

## Stack

- Components with [React](https://reactjs.org/)
- JS Framework by [Next.js](https://nextjs.org/)
- Styles [Vanilla-Extract](https://vanilla-extract.style/)
- Accessible components by [Reach UI](https://reach.tech/)
- CSS in JS made with [Vanilla-Extract](https://vanilla-extract.style/)

## Features

- Accessibility in mind
- Responsive

### Setup

- Run `yarn fresh` after cloning. This installs dependencies and runs the full
  asset pipeline (`copy:html`, fonts, images, and video variants) so generated
  files are up to date.
- Use `yarn setup` whenever locale copy or asset sources change and you need to
  regenerate everything without reinstalling dependencies.
- Start the dev server with `yarn dev`.
- When updating `fonts.config.json`, regenerate the Google Fonts URL bundle and
  optionally verify that each generated URL resolves:
  ```bash
  yarn fonts:urls                    # rebuild src/data/generated/googleFonts.gen.ts
  VERIFY_FONT_URLS=true yarn fonts:urls  # repeat with live HEAD checks against Google Fonts
  ```
- Enable the locale guardrail pre-commit hook so commits fail when markdown
  translations are missing:
  ```bash
  cp scripts/pre-commit.sh .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  ```
  The hook runs `yarn lint:locales` on every commit; fix any reported issues and
  re-run `git commit`.
