# Module: data-generated

## Purpose

Ensure generated data under `src/data/` remains reproducible and script-driven.

## Key points

- Do not hand-edit files in `src/data/generated/` or `src/data/*.gen.*`.
- Treat all generated contents as disposable outputs that should be regenerated
  via scripts.
- When behavior needs to change, update the source inputs or generator scripts
  instead of patching generated files.
