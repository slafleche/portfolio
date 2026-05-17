#!/usr/bin/env bash
set -euo pipefail

# Fast-forwards `staging` and `release` to `origin/main` and pushes both.
# Aborts if either branch cannot be fast-forwarded (i.e. has commits not on main).
# Restores the original branch on exit.

REMOTE="origin"
SOURCE="main"
TARGETS=(staging release)

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash before syncing." >&2
  exit 1
fi

ORIGINAL_BRANCH="$(git symbolic-ref --quiet --short HEAD || git rev-parse HEAD)"
restore() { git checkout --quiet "$ORIGINAL_BRANCH"; }
trap restore EXIT

echo "→ Fetching $REMOTE..."
git fetch "$REMOTE" --prune

SOURCE_SHA="$(git rev-parse "$REMOTE/$SOURCE")"
echo "→ Source: $REMOTE/$SOURCE @ ${SOURCE_SHA:0:10}"

for branch in "${TARGETS[@]}"; do
  echo ""
  echo "→ Syncing $branch..."
  git checkout --quiet "$branch"
  git pull --ff-only "$REMOTE" "$branch"
  git merge --ff-only "$SOURCE_SHA"
  git push "$REMOTE" "$branch"
  echo "✓ $branch fast-forwarded to ${SOURCE_SHA:0:10} and pushed."
done

echo ""
echo "✓ Done."
