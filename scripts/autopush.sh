#!/usr/bin/env bash
# autopush.sh — stage everything, commit, and push in one command.
#
# Usage:
#   ./scripts/autopush.sh                 # auto message from changed files
#   ./scripts/autopush.sh "my message"    # custom commit message
#   npm run autopush -- "my message"
#   git autopush "my message"             # via the alias set up in this repo
#
# Exits quietly (code 0) when there is nothing to commit.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

REMOTE="${AUTOPUSH_REMOTE:-origin}"
BRANCH="${AUTOPUSH_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

# --- Guard: never commit files that must stay private ---------------------
FORBIDDEN=(credentials.txt ".env" ".env.local" ".env.local.bak" "android/key.properties")
for f in "${FORBIDDEN[@]}"; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    echo "❌ Refusing to push: '$f' is tracked but must never be committed." >&2
    echo "   Fix with: git rm --cached \"$f\"" >&2
    exit 1
  fi
done
if git ls-files | grep -qE '\.(jks|keystore|pem)$'; then
  echo "❌ Refusing to push: a keystore/certificate file is tracked." >&2
  git ls-files | grep -E '\.(jks|keystore|pem)$' >&2
  exit 1
fi

# --- Anything to do? ------------------------------------------------------
git add -A
if git diff --cached --quiet; then
  echo "✓ Nothing to commit — already up to date."
  exit 0
fi

# --- Commit ---------------------------------------------------------------
if [ $# -gt 0 ] && [ -n "${1:-}" ]; then
  MSG="$*"
else
  FILES=$(git diff --cached --name-only)
  COUNT=$(printf '%s\n' "$FILES" | wc -l | tr -d ' ')
  PREVIEW=$(printf '%s\n' "$FILES" | head -5 | paste -sd ', ' -)
  if [ "$COUNT" -gt 5 ]; then
    PREVIEW="$PREVIEW, +$((COUNT - 5)) more"
  fi
  MSG="chore: update $COUNT file(s) ($PREVIEW)"
fi

git commit -q -m "$MSG"
echo "✓ Committed: $MSG"

# --- Tags the commit so you can find it easily ----------------------------
SHORT=$(git rev-parse --short HEAD)
echo "  $SHORT"

# --- Push -----------------------------------------------------------------
if ! git push "$REMOTE" "$BRANCH" 2>&1; then
  echo "❌ Push failed. Your commit is saved locally." >&2
  echo "   Retry with: git push $REMOTE $BRANCH" >&2
  exit 1
fi
echo "✓ Pushed to $REMOTE/$BRANCH"
