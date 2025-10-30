#!/bin/sh
set -e

# Always validate locale markdown.
corepack yarn lint:locales

# Run the full ESLint suite only on protected branches (main/master).
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
case "$branch" in
  main|master)
    echo "Running ESLint on branch '$branch'..."
    corepack yarn lint
    ;;
  *)
    echo "Skipping ESLint on branch '$branch'."
    ;;
esac
