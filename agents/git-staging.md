# Module: git-staging

## Purpose

Define how agents interact with Git and staged changes so human history and partial work are preserved.

## Key points

- Do not run `git add`, `git commit`, `git reset`, or other Git-mutating commands unless the user explicitly asks.
- Treat staged changes as a protected snapshot; avoid modifying staged files unless the user confirms it is OK for that specific file.
- When unsure about touching a staged file, describe the change and ask before applying it.

