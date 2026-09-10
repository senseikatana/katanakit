#!/usr/bin/env bash
# ============================================================
#  scripts/release.sh — Create a new release
#
#  Usage:
#    bash scripts/release.sh [patch|minor|major]
#
#  What it does:
#    1. Bumps version in package.json (yarn version)
#    2. Compiles dist/css/globals.min.css
#    3. Syncs versions.json from git tags
#    4. Commits, tags, pushes
#    5. Creates a GitHub release with auto-generated notes
# ============================================================
set -euo pipefail

BUMP="${1:-patch}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"

# Validate bump type
if [[ ! "$BUMP" =~ ^(patch|minor|major|prepatch|preminor|premajor|prerelease)$ ]]; then
  echo "ERROR: Invalid bump type: $BUMP" >&2
  echo "Usage: bash scripts/release.sh [patch|minor|major]" >&2
  exit 1
fi

echo "==> Current version: $(node -p "require('./package.json').version")"
echo "==> Bump type: $BUMP"

# 1. Bump version (yarn 4 native)
yarn version "$BUMP" --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
TAG="v$NEW_VERSION"
echo "==> New version: $NEW_VERSION (tag: $TAG)"

# 2. Build CSS artifact
echo "==> Building CSS..."
yarn build:css

# 3. Sync versions.json
echo "==> Syncing versions.json..."
bash "$SCRIPT_DIR/sync-versions.sh"

# 4. Commit, tag, push
echo "==> Committing and tagging..."
git add package.json dist/css/globals.min.css
git commit -m "release: $TAG"
git tag "$TAG"

echo "==> Pushing to origin..."
git push origin HEAD
git push origin "$TAG"

# 5. Create GitHub release
echo "==> Creating GitHub release..."
gh release create "$TAG" \
  --title "$TAG" \
  --generate-notes \
  --latest

echo ""
echo "✅ Release $TAG created!"
echo "   GitHub: https://github.com/senseikatana/katanakit-css/releases/tag/$TAG"
echo "   npm:    Auto-publishing via GitHub Actions..."
