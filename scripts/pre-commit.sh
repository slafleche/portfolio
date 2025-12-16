#!/bin/sh
set -e

# Always validate locale markdown.
corepack yarn lint:locales

# Block commits that appear to contain secrets (emails/API keys) in staged files.
corepack yarn lint:secrets:staged

# Branch-specific behaviour:
# - main / candidate/*: run full lint stack.
# - staging / release: run full publish stack (ci:publish).
# - everything else: only the generic checks above.
branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"

case "$branch" in
  main|master)
    echo "Running lint on branch '$branch'..."
    corepack yarn lint
    ;;
  candidate/*)
    echo "Running lint on candidate branch '$branch'..."
    corepack yarn lint
    ;;
  staging|release)
    echo "Running full publish checks on branch '$branch'..."
    corepack yarn ci:publish
    ;;
  *)
    echo "No additional branch-specific checks for '$branch'."
    ;;
esac
