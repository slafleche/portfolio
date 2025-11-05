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

### Favicons pipeline

- Maintain the master artwork in `src/assets/SVG/faviconMaster.svg`. Tag any
  shapes you want exported as the Safari mask with `data-mask="true"` and the
  Windows tile foreground with `data-tile-fg="true"`. The generator will throw
  if those annotations are missing so we catch regressions early.
- Run `yarn favicons` whenever the master SVG or the favicon tokens change. The
  script resets `public/favicons/`, regenerates every hashed asset, and emits a
  TypeScript manifest under `src/data/generated/favicons.manifest.gen.ts`.
- During development the generator also writes formatted `.gen.svg` artifacts
  for the tagged layers so the favicons debug page can preview them—they live in
  `public/favicons/` and are replaced on every run. The directory is fully
  ignored by git, so only the source SVG lands in version control.
