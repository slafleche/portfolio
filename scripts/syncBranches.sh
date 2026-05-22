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

# Preflight 1: local SOURCE must match REMOTE/SOURCE.
# If local is ahead, the user has unpushed commits that this script would
# silently skip. If local is behind, they may not realize they're syncing
# something older than they expect.
if git show-ref --verify --quiet "refs/heads/$SOURCE"; then
  LOCAL_SOURCE_SHA="$(git rev-parse "$SOURCE")"
  if [[ "$LOCAL_SOURCE_SHA" != "$SOURCE_SHA" ]]; then
    AHEAD="$(git rev-list --count "$REMOTE/$SOURCE..$SOURCE")"
    BEHIND="$(git rev-list --count "$SOURCE..$REMOTE/$SOURCE")"
    echo "" >&2
    echo "✗ Local '$SOURCE' is not in sync with '$REMOTE/$SOURCE'." >&2
    echo "  local  $SOURCE:        ${LOCAL_SOURCE_SHA:0:10}" >&2
    echo "  $REMOTE/$SOURCE: ${SOURCE_SHA:0:10}" >&2
    echo "  ahead: $AHEAD  behind: $BEHIND" >&2
    if (( AHEAD > 0 )); then
      echo "  You have unpushed commits on '$SOURCE'. Push them first," >&2
      echo "  otherwise this script will sync the older $REMOTE/$SOURCE state." >&2
    fi
    if (( BEHIND > 0 )); then
      echo "  Local '$SOURCE' is behind $REMOTE/$SOURCE. Pull before syncing." >&2
    fi
    exit 1
  fi
fi

# Preflight 2: each target on the remote must be an ancestor of REMOTE/SOURCE,
# otherwise the merge --ff-only step would silently no-op (target is ahead
# with its own commits) and the script would push nothing useful.
for branch in "${TARGETS[@]}"; do
  if ! git merge-base --is-ancestor "$REMOTE/$branch" "$REMOTE/$SOURCE"; then
    DIVERGED="$(git rev-list --count "$REMOTE/$SOURCE..$REMOTE/$branch")"
    echo "" >&2
    echo "✗ '$REMOTE/$branch' has $DIVERGED commit(s) not on '$REMOTE/$SOURCE':" >&2
    git log --oneline "$REMOTE/$SOURCE..$REMOTE/$branch" >&2
    echo "" >&2
    echo "  Cannot fast-forward '$branch' from '$REMOTE/$SOURCE'." >&2
    echo "  Reconcile manually (merge or reset) before re-running sync." >&2
    exit 1
  fi
done

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
