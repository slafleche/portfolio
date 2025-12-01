# Module: locales-generated

## Purpose

Protect generated locale data from hand-edits and keep it aligned with source definitions.

## Key points

- Do not hand-edit files in `src/lib/locales/generated/`.
- Regenerate contents via the appropriate localization scripts or build steps when locale data or schemas change.
- If you need to adjust behavior, modify the source locale definitions or generator code instead of editing generated outputs.

