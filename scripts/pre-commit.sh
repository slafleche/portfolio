#!/bin/sh
set -e

# Always validate locale markdown.
corepack yarn lint:locales

# Block commits that appear to contain secrets (emails/API keys) in staged files.
corepack yarn lint:secrets:staged

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
